import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import { BaseProvider } from '@ethersproject/providers';
import { Wallet } from 'ethers';

const createFlashbotsProvider = async (
  provider: BaseProvider,
  flashbots_endpoint: string,
  wallet: Wallet,
): Promise<FlashbotsBundleProvider> => {
  // ** Create Flashbots Provider ** //
  const network = await provider.getNetwork();
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    wallet,
    flashbots_endpoint,
    network.name,
  );

  return flashbotsProvider;
};

export default createFlashbotsProvider;
