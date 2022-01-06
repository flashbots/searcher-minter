import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from "ethers";

const createFlashbotsProvider = async (
  provider: Web3Provider,
  flashbots_endpoint: string,
  wallet: Wallet
): Promise<FlashbotsBundleProvider> => {

  // ** Create Flashbots Provider ** //
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    wallet,
    flashbots_endpoint
  );

  return flashbotsProvider;
};

export default createFlashbotsProvider;
