/* eslint-disable no-console */
import { FlashbotsTransactionResponse } from '@flashbots/ethers-provider-bundle';
import { BigNumber, ethers } from 'ethers';
import {
  craftBundle,
  craftTransaction,
  createFlashbotsProvider,
  sendFlashbotsBundle,
  simulateBundle,
  validateSimulation,
  validateSubmitResponse,
} from '../src/flashbots';

import {
  configure, saveJson,
  // sendFlashbotsBundle,
} from '../src/utils';

require('dotenv').config();

console.log('Yobot Searcher starting...');

// ** Main Function ** //
async function main() {
  // ** Configure ** //
  const {
    provider,
    flashbotsEndpoint,
    wallet,
    CHAIN_ID: chainId,
    // ETHER: ether,
    // GWEI: gwei,
    BLOCKS_TILL_INCLUSION: blocksUntilInclusion,
    LEGACY_GAS_PRICE: legacyGasPrice,
    PRIORITY_FEE: priorityFee,
    YobotInfiniteMintInterface: yobotInfiniteMintInterface,
    MINTING_CONTRACT: infiniteMint,
    // YobotERC721LimitOrderContractAddress: yobotERC721LimitOrderContractAddress,
    // YobotERC721LimitOrderInterface: yobotERC721LimitOrderInterface,
  } = configure();

  // ** Create Flashbots Provider ** //
  const fbp = await createFlashbotsProvider(
    provider,
    flashbotsEndpoint,
    wallet,
  );

  // ** Generate pseudo-random token ID ** //
  // const {
  //   buffer,
  //   // bigInt,
  //   // bn
  // } = generateRandomUint256();

  // ** Encode Transaction Data ** //
  const data = yobotInfiniteMintInterface.encodeFunctionData(
    'mint',
    [
      '0xf25e32C0f2928F198912A4F21008aF146Af8A05a', // address to
      ethers.utils.randomBytes(32), // uint256 tokenId
    ],
  );
  const data2 = yobotInfiniteMintInterface.encodeFunctionData(
    'mint',
    [
      '0xf25e32C0f2928F198912A4F21008aF146Af8A05a', // address to
      ethers.utils.randomBytes(32), // uint256 tokenId
    ],
  );

  // ** Craft two mint transactions ** //
  const eip1559tx = await craftTransaction(
    provider,
    wallet,
    chainId,
    blocksUntilInclusion,
    legacyGasPrice,
    priorityFee,
    BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
    infiniteMint,
    data,
    ethers.utils.parseEther('0.07'), // price of a Strict Mint ERC721 token
  );
  const eip1559tx2 = await craftTransaction(
    provider,
    wallet,
    chainId,
    blocksUntilInclusion,
    legacyGasPrice,
    priorityFee,
    BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
    infiniteMint,
    data2,
    ethers.utils.parseEther('0.07'), // price of a Strict Mint ERC721 token
  );
  console.log('Created eip1559 transaction:', eip1559tx);

  // ** Create a Signed Bundle ** //
  console.log('Creating a signed bundle...');
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
    [
      eip1559tx,
      eip1559tx2,
    ],
  );

  // ** Simulate the Bundle ** //
  console.log('Simulating Bundle: ', transactionBundle);
  console.log('Targeting block:', targetBlockNumber);
  const simulation = await simulateBundle(
    fbp,
    targetBlockNumber,
    transactionBundle,
  );

  console.log('Got Flashbots simulation:', JSON.stringify(simulation, null, 2));

  const validSimulation = validateSimulation(simulation);

  // ** Send the Bundle if not ** //
  if (validSimulation) {
    console.log('Sending the bundle...');
    const bundleRes = await sendFlashbotsBundle(
      fbp,
      targetBlockNumber,
      [
        eip1559tx,
        eip1559tx2,
      ],
    );

    saveJson('./output/mint_output.json', bundleRes);

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
    console.error(`Is simulation valid: ${validSimulation}`);
  }
}

main();
