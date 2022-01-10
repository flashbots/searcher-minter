import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';

const simulateBundle = async (
  flashbotsProvider: FlashbotsBundleProvider,
  targetBlockNumber: number,
  signedTransactions: string[], // (FlashbotsBundleTransaction | FlashbotsBundleRawTransaction)[]
) => {
  // ** Simulate ** //
  const simulation = await flashbotsProvider.simulate(signedTransactions, targetBlockNumber);
  return simulation;
};

export default simulateBundle;
