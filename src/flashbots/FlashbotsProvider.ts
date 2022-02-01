import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import { Web3Provider, InfuraProvider, AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from 'ethers';

const createFlashbotsProvider = async (
  provider: Web3Provider | InfuraProvider | AlchemyProvider,
  flashbots_endpoint: string,
  wallet: Wallet,
): Promise<FlashbotsBundleProvider> => {
  // ** Create Flashbots Provider ** //
  // const defaultGoerliProvider = providers.getDefaultProvider('goerli');
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, wallet, flashbots_endpoint, 'goerli');

  return flashbotsProvider;
};

export default createFlashbotsProvider;
