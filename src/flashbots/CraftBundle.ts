import { FlashbotsBundleProvider, FlashbotsBundleRawTransaction, FlashbotsBundleTransaction } from '@flashbots/ethers-provider-bundle';
import { Web3Provider, InfuraProvider, AlchemyProvider } from '@ethersproject/providers';

const craftBundle = async (
  provider: Web3Provider | InfuraProvider | AlchemyProvider,
  flashbotsProvider: FlashbotsBundleProvider,
  blocks_until_inclusion: number,
  bundledTransactions: (FlashbotsBundleTransaction | FlashbotsBundleRawTransaction)[],
): Promise<{ targetBlockNumber: number; transactionBundle: string[] }> => {
  const signedTransactions = await flashbotsProvider.signBundle(bundledTransactions);
  const currentBlockNumber = await provider.getBlockNumber();
  return {
    targetBlockNumber: currentBlockNumber + blocks_until_inclusion,
    transactionBundle: signedTransactions,
  };
};

export default craftBundle;
