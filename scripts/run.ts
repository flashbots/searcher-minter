/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import fetch from 'cross-fetch';
import { BigNumber, ethers } from 'ethers';
import { FlashbotsTransactionResponse } from '@flashbots/ethers-provider-bundle';
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
  configure, extractMaxSupplies, extractMintPrice, extractTotalSupplies,
} from '../src/utils';

const readline = require('readline');
const { Worker } = require('worker_threads');

require('dotenv').config();

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

// ** Webhook Body Helper ** //
const params = (content: string) => {
  return JSON.stringify({
    username: 'YOBOT SEARCHER',
    avatar_url: '',
    content,
  });
};

// ** Helper function to send discord notification ** //
const postDiscord = (url: string, body: string) => {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body,
  }).then((res: any) => {
    console.log('Sent Discord Notification:', body);
  });
};

// ** CLI Helper ** //
const enterCommand = (url: string, rl: any) => {
  rl.question('Enter command or "help" for a list of commands:\n', (input: any) => {
    const cmd = input.split(' ')[0];
    const args = input.split(' ').slice(1);
    if (cmd === 'exit') {
      postDiscord(url, params('CLI Exited!'));
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
    CHAIN_ID: chainId,
    provider,
    flashbotsEndpoint,
    wallet,
    BLOCKS_TILL_INCLUSION: blocksUntilInclusion,
    LEGACY_GAS_PRICE: legacyGasPrice,
    PRIORITY_FEE: priorityFee,
    YobotInfiniteMintInterface: yobotInfiniteMintInterface,
    MINTING_CONTRACT: infiniteMint,
    DISCORD_WEBHOOK_URL: discordWebhookUrl,
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
  let verifiedOrders: YobotBid[] = [];
  let mintingLocked = false;
  let knownMintPriceAbi: string; // the abi to get the mint price
  let knownTotalSupplyAbi: string; // the abi to get the total supply
  let knownMaxSupplyAbi: string; // the abi to get the max supply

  // TODO: Check if abi function signatures are defined by environment variables!

  // ** Create the Blocknative Mempool Listner Worker ** //
  const mempoolWorker = new Worker('./src/threads/Mempool.js');

  mempoolWorker.on('message', async (result: any) => {
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

    postDiscord(discordWebhookUrl, params(`[${transactionCount}] [${result.direction.toUpperCase()}] Transaction Received by Mempool Worker`));

    if (!mintingLocked) {
      mintingLocked = true;
      console.log('Minting not locked, proceeding to mint...');

      // ** Check how many we minted and filter those out of verified orders ** //
      // ** starting with most expensive bid ** //
      // ** NOTE: `sort` operates _in-place_, so we don't need reassignement ** //
      verifiedOrders.sort((a, b) => {
        console.log('a.priceInWeiEach:', a.priceInWeiEach);
        console.log('b.priceInWeiEach:', b.priceInWeiEach);
        return b.priceInWeiEach - a.priceInWeiEach > 1 ? 1 : -1;
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
      const filteredOrders = verifiedOrders.filter((order: YobotBid) => BigNumber.from(order.priceInWeiEach).gte(minPrice));

      // ** Now, we have a list of profitable orders we want to mint for ** //
      // ** Check how many we can mint (MAX_SUPPLY - totalSupply) ** //
      const {
        totalSupply,
        successfulAbi: successfulTotalSupplyAbi,
      } = await extractTotalSupplies(infiniteMint, provider, knownTotalSupplyAbi.length > 0 ? knownTotalSupplyAbi : undefined);
      console.log('Got total supply:', totalSupply);
      console.log('Got successfuly total supply abi:', successfulTotalSupplyAbi);
      knownTotalSupplyAbi = successfulTotalSupplyAbi;
      const {
        maxSupply,
        successfulAbi: successfulMaxSupplyAbi,
      } = await extractMaxSupplies(infiniteMint, provider, knownMaxSupplyAbi.length > 0 ? knownMaxSupplyAbi : undefined);
      console.log('Got max supply:', maxSupply);
      console.log('Got successfuly max supply abi:', successfulMaxSupplyAbi);
      knownMaxSupplyAbi = successfulMaxSupplyAbi;
      const remainingSupply = maxSupply.sub(totalSupply);

      // ** Craft the transaction data ** //
      // TODO: refactor this into a function
      const data = yobotInfiniteMintInterface.encodeFunctionData(
        'mint',
        [
          '0xf25e32C0f2928F198912A4F21008aF146Af8A05a', // address to
          ethers.utils.randomBytes(32), // uint256 tokenId
        ],
      );

      // ** Map Orders to transactions ** //
      const transactions: any[] = [];
      for (const order of filteredOrders.slice(0, remainingSupply.toNumber())) {
        // ** Craft mintable transactions ** //
        const tx = await craftTransaction(
          provider,
          wallet,
          chainId,
          blocksUntilInclusion,
          legacyGasPrice,
          priorityFee,
          BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
          infiniteMint,
          data,
          BigNumber.from(mintPrice), // value in wei (mint price)
        );
        transactions.push(tx);
      }

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
      const simulation = await simulateBundle(
        fbp,
        targetBlockNumber,
        transactionBundle,
      );

      console.log('Got Flashbots simulation:', JSON.stringify(simulation, null, 2));

      // ** Send Bundle to Flashbots ** //
      if (!validateSimulation(simulation)) { // validateSimulation returns true if the simulation errored
        console.log('Sending the bundle...');
        const bundleRes = await sendFlashbotsBundle(
          fbp,
          targetBlockNumber,
          transactions,
        );

        console.log('Bundle response:', JSON.stringify(bundleRes));
        const didBundleError = validateSubmitResponse(bundleRes);
        console.error(`Did bundle submission error: ${didBundleError}`);

        // ** Wait the response ** //
        const simulatedBundleRes = await (bundleRes as FlashbotsTransactionResponse).simulate();
        console.log('Simulated bundle response:', JSON.stringify(simulatedBundleRes));
        const awaiting = await (bundleRes as FlashbotsTransactionResponse).wait();
        console.log('Awaited response:', JSON.stringify(awaiting));

        // ** User Stats isn't implemented on goerli ** //
        if (chainId !== 5) {
          // ** Get Bundle Stats ** //
          // @ts-ignore
          // const bundleStats = await fbp.getBundleStats(simulation.bundleHash, targetBlockNumber);
          // console.log('Bundle stats:', JSON.stringify(bundleStats));

          const userStats = await fbp.getUserStats();
          console.log('User stats:', JSON.stringify(userStats));
        }

        // ** Wait for the tx to be mined ** //
        // // @ts-ignore
        // const waitResponse = await bundleRes.wait();
        // console.log('Awaited response:', JSON.stringify(waitResponse));
      } else {
        console.log('Simulation failed, discarding bundle...');
      }

      // ** Record how many we minted ** //
    }
  });

  mempoolWorker.on('error', (error: any) => {
    console.error('Mempool Worker Errored!');
    console.error(error);
    postDiscord(discordWebhookUrl, params('Mempool Worker Errored!'));
  });

  mempoolWorker.on('exit', (exitCode: any) => {
    console.warn('Mempool Worker Exited!');
    console.warn(exitCode);
    postDiscord(discordWebhookUrl, params('Mempool Worker Exited!'));
  });

  // ** Create the Yobot Orders Listner Worker ** //
  const ordersWorker = new Worker('./src/threads/Orders.js');

  ordersWorker.on('message', (result: any) => {
    orderUpdateCount += 1;
    verifiedOrders = result.orders;
    console.log('got verified orders:', verifiedOrders);
    console.log(`  [${orderUpdateCount}] Order Update - ${result.orders.length} open orders on block ${result.blockNumber}`);
  });

  ordersWorker.on('error', (error: any) => {
    console.error('Orders Worker Errored!');
    console.error(error);
    postDiscord(discordWebhookUrl, params('Orders Worker Errored!'));
  });

  ordersWorker.on('exit', (exitCode: any) => {
    console.warn('Orders Worker Exited!');
    console.warn(exitCode);
    postDiscord(discordWebhookUrl, params('Orders Worker Exited!'));
  });

  // ** Start Both Workers ** //
  mempoolWorker.postMessage({
    type: 'start',
    MINTING_CONTRACT: infiniteMint,
    CHAIN_ID: chainId,
  });
  ordersWorker.postMessage({
    type: 'start',
  });

  // ** Eat User Input ** //
  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });
  // rl.on('close', () => {
  //   enterCommand(discordWebhookUrl, rl);
  // });
  // enterCommand(discordWebhookUrl, rl);
})();
