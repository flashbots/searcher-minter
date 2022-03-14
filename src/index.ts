import { providers, Wallet } from "ethers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import * as dotenv from 'dotenv';
import privateKey from './private_key.config'

dotenv.config()

const CHAIN_ID = 5;
const provider = new providers.InfuraProvider(CHAIN_ID)

const FLASHBOTS_ENDPOINT = "https://relay-goerli.flashbots.net";

if (privateKey.private_key=== undefined) {
  console.error("Please provide WALLET_PRIVATE_KEY env")
  process.exit(1)
}
const wallet = new Wallet(privateKey.private_key, provider)

// ethers.js can use Bignumber.js class OR the JavaScript-native bigint. I changed this to bigint as it is MUCH easier to deal with
const GWEI = 10n ** 9n
const ETHER = 10n ** 18n

async function main() {
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

main();