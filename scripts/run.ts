/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { BigNumber } from 'ethers';
import { FlashbotsTransactionResponse, SimulationResponseSuccess } from '@flashbots/ethers-provider-bundle';
import { YobotBid } from '../src/types';
import {
  craftTransaction,
  createFlashbotsProvider,
  sendFlashbotsBundle,
  simulateBundle,
  validateSimulation,
  validateSubmitResponse,
  craftBundle,
} from '../src/flashbots';
import {
  callBalance,
  checkTxn,
  configure,
  extractMaxSupplies,
  extractMintPrice,
  extractTotalSupplies,
  postDiscord,
  readJson,
  saveJson,
} from '../src/utils';

const { Worker } = require('worker_threads');

require('dotenv').config();

// ** INVENTORY FILES ** //
const MINTED_ORDERS_FILE = './inventory/minted.json';
const PREVIOUS_ROUND_BALANCE = './inventory/previousRoundBalance.json';

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// !!                                 !! //
// !!   BEFORE RUNNING THIS SCRIPT,   !! //
// !!   MAKE SURE TO CONFIGURE        !! //
// !!   ENVIRONMENT VARIABLES         !! //
// !!                                 !! //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

console.log('Yobot Searcher starting...');

// ** Global State ** //
const mintSignatures: string[] = [];

// ** CLI Helper ** //
const enterCommand = (url: string, rl: any) => {
  rl.question('Enter command or "help" for a list of commands:\n', (input: any) => {
    const cmd = input.split(' ')[0];
    const args = input.split(' ').slice(1);
    if (cmd === 'exit') {
      postDiscord(url, 'CLI Exited!');
      rl.close();
    } else if (cmd === 'help') {
      console.log('Available commands:');
      console.log('   ├─ mintsig-add: Add a new mint signature to attempt to mint from');
      console.log('   └─ help: Prints this message');
    } else if (cmd === 'mintsig-add') {
      args.map((arg: string) => mintSignatures.push(arg));
    }
    // ** Continue the loop ** //
    enterCommand(url, rl);
  });
};

(async () => {
  // ** Get Configuration ** //
  const {
    provider,
    flashbotsEndpoint,
    wallet,
    EOA_ADDRESS,
    CHAIN_ID: chainId,
    BLOCKS_TILL_INCLUSION: blocksUntilInclusion,
    LEGACY_GAS_PRICE: legacyGasPrice,
    PRIORITY_FEE: priorityFee,
    YobotERC721LimitOrderContract,
    YobotInfiniteMintInterface: yobotInfiniteMintInterface,
    MINTING_CONTRACT: infiniteMint,
    DISCORD_WEBHOOK_URL: discordWebhookUrl,
    PUBLIC_DISCORD_WEBHOOK_URL: pubDiscordWebhook,
  } = configure();

  // ** Create Flashbots Provider ** //
  const fbp = await createFlashbotsProvider(
    provider,
    flashbotsEndpoint,
    wallet,
  );

  // ** STATE ** //
  let orderUpdateCount = 0;
  let transactionCount = 0;
  let verifiedOrders: any[] = [];
  let mintedOrders: any[] = [];
  let mintingLocked = false;
  let knownMintPriceAbi: string; // the abi to get the mint price
  let knownTotalSupplyAbi: string; // the abi to get the total supply
  let knownMaxSupplyAbi: string; // the abi to get the max supply
  let previousRoundBalance: number = 0; // The previous round balance to track inventory
  let inventoryQty: number = 0; // The inventory quantity
  let walletTokens: any[] = []; // The tokens in the wallet
  let isTotalSupplyDerived: boolean = false;
  let derivedTotalSupply: number = 0;

  // ** ///////////////////////////////////////// ** //
  // **              Define Workers               ** //
  // ** ///////////////////////////////////////// ** //

  const mempoolWorker = new Worker('./src/threads/Mempool.js');
  const walletWorker = new Worker('./src/threads/Wallet.js');
  const ordersWorker = new Worker('./src/threads/Orders.js');
  const intervalWorker = new Worker('./src/threads/Interval.js');
  const fillOrdersWorker = new Worker('./src/threads/FillOrders.js');

  // ** Read stashed mintedOrders ** //
  mintedOrders = readJson(MINTED_ORDERS_FILE).orders;
  previousRoundBalance = readJson(PREVIOUS_ROUND_BALANCE).balance;

  // TODO: check mintedOrders to see if they're complete

  // TODO: Check if abi function signatures are defined by environment variables!

  // ** Checks if our pending ERC721 mints are completed (would result in double count since balance increments too) ** //
  const updateMintedOrders = async (mOrders: any[]) => {
    const updatedOrders = [];

    // ** Iterate mintedOrders and check status ** //
    for (const mo of mOrders) {
      console.log('mintedOrder:', mo);
      const checkedTxn = await checkTxn(mo.txHash, provider);
      // ** If the transaction hasn't landed yet, add back to pending orders ** //
      if (!checkedTxn) updatedOrders.push(mo);
    }

    return updatedOrders;
  };

  // ** Attempts to fill orders using the searcher's balance (NOT inventory) ** //
  const fillOrders = (
    remainingOrders: any[],
    currentGasPrice: any,
  ) => {
    console.log('Sending Fill orders to Fill Orders Worker...');
    fillOrdersWorker.postMessage({
      type: 'fill',
      walletTokens, // : JSON.stringify(walletTokens),
      remainingOrders, // : JSON.stringify(remainingOrders),
    });
  };

  // ** ///////////////////////////////////////// ** //
  // ** ///////////////////////////////////////// ** //
  // **                                           ** //
  // **             Trigger Minting               ** //
  // **                                           ** //
  // ** ///////////////////////////////////////// ** //
  // ** ///////////////////////////////////////// ** //

  const mintHandler = async (result: any) => {
    if (result !== 'TIME_GRANULARITY') {
      transactionCount += 1;
      console.log('-----------------------------------------');
      console.log(`[${transactionCount}] [${result.direction.toUpperCase()}] Transaction Received by Mempool Worker`);
      console.log(`   ├─ Status: ${result.status}`);
      console.log(`   ├─ From: ${result.from}`);
      console.log(`   ├─ To: ${result.to}`);
      console.log(`   ├─ Gas Price: ${result.gasPrice}`);
      console.log(`   ├─ Gas Price Gwei: ${result.gasPriceGwei}`);
      console.log(`   ├─ Gas Used: ${result.gasUsed}`);
      console.log(`   ├─ Timestamp: ${result.timestamp}`);
      console.log(`   └─ Network: ${result.network}`);
      console.log('-----------------------------------------');
      await postDiscord(discordWebhookUrl, `📦 [${transactionCount}] MEMPOOL TRANSACTION DETECTED [${result.direction.toUpperCase()}] 📦`);
    }

    if (!mintingLocked) {
      mintingLocked = true;
      console.log('Minting not locked, proceeding to mint...');

      // ** ///////////////////////////////////////// ** //
      // **                                           ** //
      // **           Filter Mintable Bids            ** //
      // **                                           ** //
      // ** ///////////////////////////////////////// ** //

      // ** starting with most expensive bid ** //
      // ** NOTE: `sort` operates _in-place_, so we don't need reassignement ** //
      verifiedOrders.sort((a, b) => {
        // ** Parse strings as big numbers ** //
        const bp = BigNumber.from(b.priceInWeiEach);
        const ap = BigNumber.from(a.priceInWeiEach);
        return bp.sub(ap).gt(1) ? 1 : -1;
      });

      // ** Filter out orders that are not profitable... ** //
      // ** ie: priceInWeiEach < gas price + mint cost ** //
      const currentGasPrice = await provider.getGasPrice();
      const {
        bestEstimate: mintPrice,
        successfulAbi: successfulMintAbi,
      } = await extractMintPrice(
        infiniteMint,
        provider,
        (knownMintPriceAbi !== undefined && knownMintPriceAbi.length > 0) ? knownMintPriceAbi : undefined,
      );
      console.log('Got mint price:', mintPrice);
      console.log('Got successfuly mint abi:', successfulMintAbi);
      knownMintPriceAbi = successfulMintAbi;
      const minPrice = mintPrice.add(currentGasPrice);
      console.log('Filtering with minPrice:', minPrice.toString());
      const filteredOrders = verifiedOrders.filter((order: YobotBid) => {
        return minPrice.lt(order.priceInWeiEach);
      });
      console.log('Got filtered orders:', filteredOrders.length);

      // ** ///////////////////////////////////////// ** //
      // **                                           ** //
      // **   Determine how many searcher can mint    ** //
      // **                                           ** //
      // ** ///////////////////////////////////////// ** //

      // ** Now, we have a list of profitable orders we want to mint for ** //
      // ** Check how many we can mint (MAX_SUPPLY - totalSupply) ** //
      const {
        totalSupply,
        successfulAbi: successfulTotalSupplyAbi,
      } = await extractTotalSupplies(
        infiniteMint,
        provider,
        (knownTotalSupplyAbi !== undefined && knownTotalSupplyAbi.length > 0) ? knownTotalSupplyAbi : undefined,
      );
      console.log('Got total supply:', totalSupply);
      console.log('Got successfuly total supply abi:', successfulTotalSupplyAbi);
      knownTotalSupplyAbi = successfulTotalSupplyAbi;
      const {
        maxSupply,
        successfulAbi: successfulMaxSupplyAbi,
      } = await extractMaxSupplies(
        infiniteMint,
        provider,
        (knownMaxSupplyAbi !== undefined && knownMaxSupplyAbi.length > 0) ? knownMaxSupplyAbi : undefined,
      );
      console.log('Got max supply:', maxSupply);
      console.log('Got successfuly max supply abi:', successfulMaxSupplyAbi);
      knownMaxSupplyAbi = successfulMaxSupplyAbi;
      const remainingSupply = maxSupply.sub(totalSupply);
      console.log('Remaining supply:', remainingSupply);

      // ** Fetch the Balance of the searcher ** //
      const balance = await callBalance(
        infiniteMint,
        EOA_ADDRESS,
        provider,
      );
      let balanceInt: number = 0;
      try {
        balanceInt = balance.toNumber();
      } catch (e) {
        // !! IGNORE !! //
      }

      // ** If balance changed, we check mintedOrders for tx finality ** //
      if (balance.toNumber() !== previousRoundBalance) {
        mintedOrders = await updateMintedOrders(mintedOrders);
        previousRoundBalance = balance;
        saveJson(MINTED_ORDERS_FILE, JSON.parse(JSON.stringify({ orders: mintedOrders })));
        const prevBalanceJSON = JSON.parse(JSON.stringify({ balance: previousRoundBalance }));
        saveJson(PREVIOUS_ROUND_BALANCE, prevBalanceJSON);
      }

      // ** Inventory is the searcher's balance plus minted orders ** //
      const inventory = balanceInt + mintedOrders.length;
      // TODO: replace mintedOrders.length with mintedOrdersQty
      inventoryQty = balanceInt + mintedOrders.length;
      console.log('Searcher inventory:', inventory);

      // ** Update the previous balance ** //
      previousRoundBalance = balance;

      // ** Fillable orders is just all open orders - handle pending fill orders in fillorders worker ** //
      const fillableOrders = filteredOrders; // .slice(mintedOrders.length, remainingSupply.toNumber());
      console.log('Fillable orders:', fillableOrders.length);

      // ** Check enough left to mint from the total supply minus how many we minted** //
      const remainingSupplyNum = remainingSupply.toNumber();
      const remainingOrders = filteredOrders.slice(inventory).slice(0, remainingSupply.toNumber());
      const numberLeftToMint = filteredOrders.map((o) => parseInt(o.quantity, 10));
      console.log('Reduced orders:', numberLeftToMint);

      const reducedNumToMint = numberLeftToMint.reduce((a, b) => a + b, 0) - inventoryQty;

      console.log('Number left to mint:', reducedNumToMint);

      // ** ///////////////////////////////////////// ** //
      // **                                           ** //
      // **            CRAFT TRANSACTIONS             ** //
      // **                                           ** //
      // ** ///////////////////////////////////////// ** //

      // ** Use derived total supply if we are failing to mint ** //
      let mintingTotalSupply = totalSupply.toNumber();
      if (mintingTotalSupply === 0 && (
        successfulTotalSupplyAbi === undefined
        || successfulTotalSupplyAbi === ''
      )) {
        mintingTotalSupply = derivedTotalSupply;
        isTotalSupplyDerived = true;
      }

      // ** Get previous block's gas limit ** //
      const currentBlockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(currentBlockNumber);
      const blockGasLimit = block.gasLimit;

      // ** Map Orders to transactions ** //
      const transactions: any[] = [];
      let cumulativeGasCost = BigNumber.from(0);
      for (let i = 0; i < reducedNumToMint; i += 1) {
        // ** Craft the transaction data ** //
        // TODO: refactor this into a function
        const data: any = yobotInfiniteMintInterface.encodeFunctionData(
          'mint',
          [
            EOA_ADDRESS, // address to
            mintingTotalSupply + i,
            // ethers.utils.randomBytes(32), // uint256 tokenId
          ],
        );
        console.log('Crafting transaction with token id:', totalSupply.toNumber() + i);

        // ** Estimating tx gas ** //
        const gasEstimate = await provider.estimateGas({ to: infiniteMint, from: EOA_ADDRESS, data });
        console.log('Got gas estimate:', gasEstimate);

        if (cumulativeGasCost.add(gasEstimate).gt(blockGasLimit)) {
          console.log('Gas limit reached, sending a bundle with tx count:', transactions.length);
          break;
        } else {
          cumulativeGasCost = cumulativeGasCost.add(gasEstimate);
        }

        // ** Craft mintable transactions ** //
        const tx = await craftTransaction(
          provider,
          wallet,
          chainId,
          blocksUntilInclusion,
          legacyGasPrice,
          priorityFee,
          gasEstimate, // BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
          infiniteMint,
          data,
          BigNumber.from(mintPrice), // value in wei (mint price)
        );
        transactions.push(tx);
        console.log('Got Crafted Transaction:', tx);
      }

      // ** Update our total supply if derived ** //
      if (isTotalSupplyDerived) derivedTotalSupply += transactions.length;

      console.log('Transactions:', transactions.length);

      // !!!!! EXIT IF NO TRANSACTIONS !!!!! //
      if (transactions.length <= 0) {
        // TODO: alert a public discord channel if orders don't have enough wei

        // ** We still want to try to fill orders if we have an inventory ** //
        if (inventory > 0) {
          fillOrders(fillableOrders, currentGasPrice);
        }

        // ** Release the Minting Lock ** //
        mintingLocked = false;
        return;
      }
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

      // ** ///////////////////////////////////////// ** //
      // **                                           ** //
      // **                CRAFT BUNDLE               ** //
      // **                                           ** //
      // ** ///////////////////////////////////////// ** //

      // ** Craft a signed bundle of transactions ** //
      const {
        targetBlockNumber,
        transactionBundle,
      }: {
        targetBlockNumber: number,
        transactionBundle: string[]
      } = await craftBundle(
        provider,
        fbp,
        blocksUntilInclusion,
        transactions,
      );

      // ** Simulate Bundle ** //
      console.log('Simulating Bundle: ', transactionBundle);
      console.log('Targeting block:', targetBlockNumber);
      let simulation;
      try {
        simulation = await simulateBundle(
          fbp,
          targetBlockNumber,
          transactionBundle,
        );
      } catch (e) {
        console.log('Simulation error:', e);
        await postDiscord(
          discordWebhookUrl,
          `❌ MINTING SIMULATION ERRORED ❌ Response=${JSON.stringify(e.body)}`,
        );
        mintingLocked = false;
        return;
      }

      console.log('Got Flashbots simulation:', JSON.stringify(simulation, null, 2));

      // ** Send Bundle to Flashbots ** //
      if (validateSimulation(simulation)) { // validateSimulation returns true if the simulation errored
        await postDiscord(
          discordWebhookUrl,
          '✅ SIMULATION SUCCESSFUL ✅',
        );
        await postDiscord(
          discordWebhookUrl,
          `💨 SENDING FLASHBOTS BUNDLE :: Block Target=${targetBlockNumber}, Transaction Count=${transactions.length}`,
        );
        const bundleRes = await sendFlashbotsBundle(
          fbp,
          targetBlockNumber,
          transactions,
        );

        console.log('Bundle response:', JSON.stringify(bundleRes));
        const didBundleError = validateSubmitResponse(bundleRes);
        console.error(`Did bundle submission error: ${didBundleError}`);

        await postDiscord(
          discordWebhookUrl,
          `🚀 BUNDLE SENT - ${JSON.stringify(bundleRes)}`,
        );

        // ** Wait the response ** //
        const simulatedBundleRes = await (bundleRes as FlashbotsTransactionResponse).simulate();
        console.log('Simulated bundle response:', JSON.stringify(simulatedBundleRes));
        const awaiting = await (bundleRes as FlashbotsTransactionResponse).wait();
        console.log('Awaited response:', JSON.stringify(awaiting));

        await postDiscord(
          discordWebhookUrl,
          `🎉 AWAITED BUNDLE RESPONSE - ${JSON.stringify(simulatedBundleRes)}`,
        );

        // ** User Stats isn't implemented on goerli ** //
        if (chainId !== 5) {
          // ** Get Bundle Stats ** //
          // @ts-ignore
          // const bundleStats = await fbp.getBundleStats(simulation.bundleHash, targetBlockNumber);
          // console.log('Bundle stats:', JSON.stringify(bundleStats));

          const searcherStats = await fbp.getUserStats();
          console.log('User stats:', JSON.stringify(searcherStats));

          await postDiscord(
            discordWebhookUrl,
            `👑 SEARCHER STATS: ${JSON.stringify(searcherStats)}`,
          );
        }

        // ** Loop over the simulatedBundleRes.results and add gas cost to orders ** //
        const gasOrders = 'results' in simulatedBundleRes ? (simulatedBundleRes as SimulationResponseSuccess).results : [];

        console.log('Is results in simulated bundle response:', 'results' in simulatedBundleRes);
        console.log('Gas orders:', JSON.stringify(gasOrders));

        // ** Add these to the minted orders ** //
        mintedOrders = [...mintedOrders, ...gasOrders];

        // ** Try to fill orders ** //
        fillOrders(fillableOrders, currentGasPrice);
      } else {
        console.log('Simulation failed, discarding bundle...');
        await postDiscord(
          discordWebhookUrl,
          '❌ SIMULATION FAILED - DISCARDING BUNDLE ❌',
        );
      }

      // ** Release the Minting Lock ** //
      mintingLocked = false;
    } else {
      console.log('Minting locked');
      await postDiscord(
        discordWebhookUrl,
        '🔒 MINTING LOCKED 🔒',
      );
    }
  };

  // ** ///////////////////////////////////////// ** //
  // ** ///////////////////////////////////////// ** //
  // **                                           ** //
  // **               WORKER HOOKS                ** //
  // **                                           ** //
  // ** ///////////////////////////////////////// ** //
  // ** ///////////////////////////////////////// ** //

  mempoolWorker.on('message', mintHandler);

  mempoolWorker.on('error', async (error: any) => {
    console.error('Mempool Worker Errored!');
    console.error(error);
    await postDiscord(discordWebhookUrl, 'Mempool Worker Errored!');
  });

  mempoolWorker.on('exit', async (exitCode: any) => {
    console.warn('Mempool Worker Exited!');
    console.warn(exitCode);
    await postDiscord(discordWebhookUrl, 'Mempool Worker Exited!');
  });

  ordersWorker.on('message', (result: any) => {
    orderUpdateCount += 1;
    verifiedOrders = result.orders;
    console.log('got verified orders:', verifiedOrders.length);
    console.log(`  [${orderUpdateCount}] Order Update - ${result.orders.length} open orders on block ${result.blockNumber}`);
  });

  ordersWorker.on('error', async (error: any) => {
    console.error('Orders Worker Errored!');
    console.error(error);
    await postDiscord(discordWebhookUrl, 'Orders Worker Errored!');
  });

  ordersWorker.on('exit', async (exitCode: any) => {
    console.warn('Orders Worker Exited!');
    console.warn(exitCode);
    await postDiscord(discordWebhookUrl, 'Orders Worker Exited!');
  });

  // intervalWorker.on('message', async (trigger: any) => {
  //   console.log(`INTERVAL TRIGGER [${new Date().getTime()}]`);
  //   await mintHandler(trigger);
  // });

  // intervalWorker.on('error', async (error: any) => {
  //   console.error('Interval Worker Errored!');
  //   console.error(error);
  //   await postDiscord(discordWebhookUrl, 'Interval Worker Errored!');
  // });

  // intervalWorker.on('exit', async (exitCode: any) => {
  //   console.warn('Interval Worker Exited!');
  //   console.warn(exitCode);
  //   await postDiscord(discordWebhookUrl, 'Interval Worker Exited!');
  // });

  walletWorker.on('message', async (tokens: any) => {
    console.log(`WALLET TRIGGER [${new Date().getTime()}]`);
    // ** Set the tokens in the wallet ** //
    walletTokens = tokens;
    await mintHandler('TIME_GRANULARITY');
  });

  walletWorker.on('error', async (error: any) => {
    console.error('Wallet Worker Errored!');
    console.error(error);
    await postDiscord(discordWebhookUrl, 'Wallet Worker Errored!');
  });

  walletWorker.on('exit', async (exitCode: any) => {
    console.warn('Wallet Worker Exited!');
    console.warn(exitCode);
    await postDiscord(discordWebhookUrl, 'Wallet Worker Exited!');
  });

  fillOrdersWorker.on('message', () => {
    console.log(`Parent Got Message from FillOrders Worker [${new Date().getTime()}]`);
  });

  fillOrdersWorker.on('error', async (error: any) => {
    console.error('FillOrders Worker Errored!');
    console.error(error);
    await postDiscord(discordWebhookUrl, 'FillOrders Worker Errored!');
  });

  fillOrdersWorker.on('exit', async (exitCode: any) => {
    console.warn('FillOrders Worker Exited!');
    console.warn(exitCode);
    await postDiscord(discordWebhookUrl, 'FillOrders Worker Exited!');
  });

  // ** Start Workers ** //
  mempoolWorker.postMessage({
    type: 'start',
    MINTING_CONTRACT: infiniteMint,
    CHAIN_ID: chainId,
  });
  ordersWorker.postMessage({
    type: 'start',
  });
  intervalWorker.postMessage({
    type: 'start',
  });
  walletWorker.postMessage({
    type: 'start',
  });

  // ** Send a start to fill orders worker to instantiate local variables ** //
  fillOrdersWorker.postMessage({
    type: 'start',
  });
})();
