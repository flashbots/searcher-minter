/* eslint-disable @typescript-eslint/naming-convention */
import { InfuraProvider } from '@ethersproject/providers';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import { BigNumber, Wallet } from 'ethers';
import { Interface } from 'ethers/lib/utils';

import {
  sendFlashbotsBundle,
  craftBundle,
  createFlashbotsProvider,
  simulateBundle,
} from '../src/flashbots';
import { configure } from '../src/utils';

let provider: InfuraProvider;
let flashbots_endpoint: string;
let wallet: Wallet;
let flashbotsProvider: FlashbotsBundleProvider;
let chain_id: number;
let ether: BigNumber;
let gwei: BigNumber;
let blocksUntilInclusion: number;
let legacyGasPrice: BigNumber;
let priorityFee: BigNumber;
let yobotERC721LimitOrderContractAddress: string;
let yobotERC721LimitOrderInterface: Interface;

beforeAll(() => {
  // ** Configure ** //
  const config = configure();
  // @ts-ignore
  provider = config.provider;
  flashbots_endpoint = config.flashbotsEndpoint;
  wallet = config.wallet;
  chain_id = config.CHAIN_ID;
  ether = config.ETHER;
  gwei = config.GWEI;
  blocksUntilInclusion = config.BLOCKS_TILL_INCLUSION;
  legacyGasPrice = config.LEGACY_GAS_PRICE;
  priorityFee = config.PRIORITY_FEE;
  yobotERC721LimitOrderContractAddress = config.YobotERC721LimitOrderContractAddress;
  yobotERC721LimitOrderInterface = config.YobotERC721LimitOrderInterface;

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
  it('simulates a flashbots bundle', () =>
    // ** Have to asynchronously fetch the current block number from the provider ** //
    // eslint-disable-next-line implicit-arrow-linebreak
    craftBundle(
      provider,
      flashbotsProvider,
      wallet,
      chain_id,
      blocksUntilInclusion,
      legacyGasPrice,
      priorityFee,
      wallet.address, // mock to address using the wallet address
      '0x', // no data
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
        expect(1).toBe(1);
      });
    }));

  // put x infront to prevent running during github actions //
  xtest('sends a flashbots bundle', () => {
    // ** Have to asynchronously fetch the current block number from the provider ** //

    // ** Craft data for transaction ** //
    const data = yobotERC721LimitOrderInterface.encodeFunctionData(
      'fillOrder',
      [],
    );

    // eslint-disable-next-line implicit-arrow-linebreak
    craftBundle(
      provider,
      flashbotsProvider,
      wallet,
      chain_id,
      blocksUntilInclusion,
      legacyGasPrice,
      priorityFee,
      yobotERC721LimitOrderContractAddress,
      data,
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
        provider,
        flashbots_endpoint,
        chain_id,
        ether,
        gwei,
        wallet,
        yobotERC721LimitOrderContractAddress, // 'to' address
        data, // 'data'
      ).then((simulation) => {
        console.log('Got Flashbots simulation:', JSON.stringify(simulation, null, 2));
        expect(1).toBe(1);
      });
    }));
});
