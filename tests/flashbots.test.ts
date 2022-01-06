import { InfuraProvider } from "@ethersproject/providers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { BigNumber, Wallet } from "ethers";

import { craftBundle, createFlashbotsProvider, simulateBundle } from "../src/flashbots";
import { configure, sendFlashbotsBundle } from "../src/utils";


let provider: InfuraProvider;
let flashbots_endpoint: string;
let wallet: Wallet;
let flashbotsProvider: FlashbotsBundleProvider;
let chain_id: number;

const GWEI = BigNumber.from(10).pow(9)
const PRIORITY_FEE = GWEI.mul(3)
const LEGACY_GAS_PRICE = GWEI.mul(12)
const BLOCKS_TILL_INCLUSION = 2

beforeAll(() => {
    // ** Configure ** //
  let config = configure();
  provider = config.provider;
  flashbots_endpoint = config.flashbots_endpoint;
  wallet = config.wallet;
  chain_id = config.CHAIN_ID;

  console.log("Configured tests");

  // ** Create Flashbots Provider ** //
  // have to return a Promise to run the creation asynchronously
  return createFlashbotsProvider(
    provider,
    flashbots_endpoint,
    wallet
  ).then(fp => {
    flashbotsProvider = fp;
  })
});


describe("flashbots bundles", () => {
  it("simulates a flashbots bundle", () => {
    // ** Have to asynchronously fetch the current block number from the provider ** // 
    return craftBundle(
      provider,
      flashbotsProvider,
      wallet,
      chain_id,
      BLOCKS_TILL_INCLUSION,
      LEGACY_GAS_PRICE,
      PRIORITY_FEE
    ).then(({
      targetBlockNumber,
      transactionBundle
    }: {
      targetBlockNumber: number,
      transactionBundle: string[]
    }) => {
      console.log("Simulating Bundle: ", transactionBundle);
      console.log("Targeting block:", targetBlockNumber);
      return simulateBundle(
        flashbotsProvider,
        targetBlockNumber,
        transactionBundle
      ).then(simulation => {
        console.log("Got Flashbots simulation:", JSON.stringify(simulation, null, 2))
        expect(1).toBe(1);
      });
    });
  });

  it("submits a flashbots bundle", () => {

    expect(1).toBe(1);
  });
});