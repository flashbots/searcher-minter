/* eslint-disable no-console */
import { BigNumber, ethers } from 'ethers';
import {
  craftBundle,
  craftTransaction,
  createFlashbotsProvider,
  simulateBundle,
  validateSimulation,
} from '../src/flashbots';

import {
  configure,
  // sendFlashbotsBundle,
} from '../src/utils';

require('dotenv').config();

console.log('Yobot Searcher starting...');

const INFINITE_MINT = '0xc47eff74c2e949fee8a249586e083f573a7e56fa';

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
    INFINITE_MINT,
    data,
  );
  const eip1559tx2 = await craftTransaction(
    provider,
    wallet,
    chainId,
    blocksUntilInclusion,
    legacyGasPrice,
    priorityFee,
    BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
    INFINITE_MINT,
    data2,
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

  const didSimulationError = validateSimulation(simulation);
  console.log(`Did the simulation error: ${didSimulationError}`);

  // ** Send the Bundle ** //
  console.log('Sending the bundle...');
}

main();
