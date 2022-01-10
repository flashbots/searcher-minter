/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
import { InfuraProvider } from '@ethersproject/providers';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import { BigNumber, ethers, Wallet } from 'ethers';
import { Interface } from 'ethers/lib/utils';

import {
  sendFlashbotsBundle,
  craftBundle,
  createFlashbotsProvider,
  simulateBundle,
  craftTransaction,
  validateSubmitResponse,
  validateSimulation,
} from '../src/flashbots';
import { configure } from '../src/utils';

let provider: InfuraProvider;
let flashbots_endpoint: string;
let wallet: Wallet;
let flashbotsProvider: FlashbotsBundleProvider;
let chain_id: number;
// let ether: BigNumber;
// let gwei: BigNumber;
let blocksUntilInclusion: number;
let legacyGasPrice: BigNumber;
let priorityFee: BigNumber;
// let yobotERC721LimitOrderContractAddress: string;
// let yobotERC721LimitOrderInterface: Interface;
let yobotInfiniteMintInterface: Interface;
let infiniteMint: string;

beforeAll(() => {
  // ** Configure ** //
  const config = configure();
  // @ts-ignore
  provider = config.provider;
  flashbots_endpoint = config.flashbotsEndpoint;
  wallet = config.wallet;
  chain_id = config.CHAIN_ID;
  // ether = config.ETHER;
  // gwei = config.GWEI;
  blocksUntilInclusion = config.BLOCKS_TILL_INCLUSION;
  legacyGasPrice = config.LEGACY_GAS_PRICE;
  priorityFee = config.PRIORITY_FEE;
  // yobotERC721LimitOrderContractAddress = config.YobotERC721LimitOrderContractAddress;
  // yobotERC721LimitOrderInterface = config.YobotERC721LimitOrderInterface;
  yobotInfiniteMintInterface = config.YobotInfiniteMintInterface;
  infiniteMint = config.MINTING_CONTRACT;

  console.log('Configured tests');

  // ** Create Flashbots Provider ** //
  // have to return a Promise to run the creation asynchronously
  return createFlashbotsProvider(
    provider,
    flashbots_endpoint,
    wallet,
  ).then((fp) => {
    flashbotsProvider = fp;
  });
});

describe('flashbots bundles', () => {
  it('simulates a flashbots bundle', () => {
    const data = yobotInfiniteMintInterface.encodeFunctionData(
      'mint',
      [
        '0xf25e32C0f2928F198912A4F21008aF146Af8A05a', // address to
        ethers.utils.randomBytes(32), // uint256 tokenId
      ],
    );

    // ** Have to asynchronously fetch the current block number from the provider ** //
    return craftTransaction(
      provider,
      wallet,
      chain_id,
      blocksUntilInclusion,
      legacyGasPrice,
      priorityFee,
      BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
      infiniteMint,
      data,
    ).then((tx) => craftBundle(
      provider,
      flashbotsProvider,
      blocksUntilInclusion,
      [tx],
    ).then(({
      targetBlockNumber,
      transactionBundle,
    }: {
      targetBlockNumber: number,
      transactionBundle: string[]
    }) => {
      console.log('Simulating Bundle: ', transactionBundle);
      console.log('Targeting block:', targetBlockNumber);
      return simulateBundle(
        flashbotsProvider,
        targetBlockNumber,
        transactionBundle,
      ).then((simulation) => {
        console.log('Got Flashbots simulation:', JSON.stringify(simulation, null, 2));
        // expect the simulation not to have errors
        expect(validateSimulation(simulation)).toBe(false);
      });
    }));
  });

  xtest('sends a flashbots bundle', () => {
    const data = yobotInfiniteMintInterface.encodeFunctionData(
      'mint',
      [
        '0xf25e32C0f2928F198912A4F21008aF146Af8A05a', // address to
        ethers.utils.randomBytes(32), // uint256 tokenId
      ],
    );

    // ** Have to asynchronously fetch the current block number from the provider ** //
    return craftTransaction(
      provider,
      wallet,
      chain_id,
      blocksUntilInclusion,
      legacyGasPrice,
      priorityFee,
      BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
      infiniteMint,
      data,
    ).then((tx) => craftBundle(
      provider,
      flashbotsProvider,
      blocksUntilInclusion,
      [tx],
    ).then(({
      targetBlockNumber,
      transactionBundle,
    }: {
      targetBlockNumber: number,
      transactionBundle: string[]
    }) => {
      console.log('Sending Bundle: ', transactionBundle);
      console.log('Targeting block:', targetBlockNumber);
      return sendFlashbotsBundle(
        flashbotsProvider,
        targetBlockNumber,
        [tx],
      ).then((response) => {
        console.log('Sent Flashbots bundle:', JSON.stringify(response, null, 2));
        // expect the bundle not to have errors
        expect(validateSubmitResponse(response)).toBe(false);
      });
    }));
  });
});
