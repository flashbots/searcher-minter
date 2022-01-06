/* eslint-disable @typescript-eslint/naming-convention */
import { InfuraProvider } from '@ethersproject/providers';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import { BigNumber, Wallet } from 'ethers';

import { craftBundle, createFlashbotsProvider, simulateBundle } from '../src/flashbots';
import { configure } from '../src/utils';

let provider: InfuraProvider;
let flashbots_endpoint: string;
let wallet: Wallet;
let flashbotsProvider: FlashbotsBundleProvider;
let chain_id: number;
let blocksUntilInclusion: number;
let legacyGasPrice: BigNumber;
let priorityFee: BigNumber;

beforeAll(() => {
  // ** Configure ** //
  const config = configure();
  // @ts-ignore
  provider = config.provider;
  flashbots_endpoint = config.flashbotsEndpoint;
  wallet = config.wallet;
  chain_id = config.CHAIN_ID;
  blocksUntilInclusion = config.BLOCKS_TILL_INCLUSION;
  legacyGasPrice = config.LEGACY_GAS_PRICE;
  priorityFee = config.PRIORITY_FEE;

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

  it('submits a flashbots bundle', () => {
    expect(1).toBe(1);
  });
});
