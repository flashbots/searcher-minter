import { Wallet } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";

const sendFlashbotsBundle = async (
  provider: Web3Provider,
  FLASHBOTS_ENDPOINT: string,
  CHAIN_ID: number,
  ETHER: bigint,
  GWEI: bigint,
  wallet: Wallet,
) => {
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, Wallet.createRandom(), FLASHBOTS_ENDPOINT)
    provider.on('block', async (blockNumber) => {
      console.log(blockNumber)

      const bundleSubmitResponse = await flashbotsProvider.sendBundle(
        [
          {
            transaction: {
              chainId: CHAIN_ID,
              type: 2,
              value: ETHER / 100n * 3n,
              data: "0x1249c58b",
              maxFeePerGas: GWEI * 3n,
              maxPriorityFeePerGas: GWEI * 2n,
              to: "0x20EE855E43A7af19E407E39E5110c2C1Ee41F64D"
            },
            signer: wallet
          }
        ], blockNumber + 1
      )

      // By exiting this function (via return) when the type is detected as a "RelayResponseError", TypeScript recognizes bundleSubmitResponse must be a success type object (FlashbotsTransactionResponse) after the if block.
      if ('error' in bundleSubmitResponse) {
        console.warn(bundleSubmitResponse.error.message)
        return
      }

      console.log(await bundleSubmitResponse.simulate())
    })
}

export default sendFlashbotsBundle;