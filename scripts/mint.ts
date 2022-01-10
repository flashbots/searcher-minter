/* eslint-disable no-console */
import { ethers } from 'ethers';
import { craftBundle, createFlashbotsProvider, simulateBundle } from '../src/flashbots';

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
  const randomTokenId = ethers.utils.randomBytes(32);
  console.log(`32 bytes of random data: ${randomTokenId}`);

  // ** Encode Transaction Data ** //
  const data = yobotInfiniteMintInterface.encodeFunctionData(
    'mint',
    [
      '0x0000000000000000000000000000000000000000', // address to
      randomTokenId, // uint256 tokenId
    ],
  );

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
    wallet,
    chainId,
    blocksUntilInclusion,
    legacyGasPrice,
    priorityFee,
    INFINITE_MINT,
    data,
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

  // ** Send the Bundle ** //
  console.log('Sending the bundle...');
}

main();
