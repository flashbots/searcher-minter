// import { BigNumber, Wallet } from 'ethers';
// import { InfuraProvider } from '@ethersproject/providers';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';

const sendFlashbotsBundle = async (
  flashbotsProvider: FlashbotsBundleProvider,
  targetBlockNumber: number,
  signedTransactions: any[], // (FlashbotsBundleTransaction | FlashbotsBundleRawTransaction)[]
) => {
  const bundleSubmitResponse = await flashbotsProvider.sendBundle(
    signedTransactions,
    targetBlockNumber,
  );
  return bundleSubmitResponse;
};

const sendRawFlashbotsBundle = async (
  flashbotsProvider: FlashbotsBundleProvider,
  targetBlockNumber: number,
  signedTransactions: any[], // (FlashbotsBundleTransaction | FlashbotsBundleRawTransaction)[]
) => {
  const bundleSubmitResponse = await flashbotsProvider.sendRawBundle(
    signedTransactions,
    targetBlockNumber,
  );
  return bundleSubmitResponse;
};

export {
  sendFlashbotsBundle,
  sendRawFlashbotsBundle,
};

// const sendFlashbotsBundle = async (
//   provider: InfuraProvider,
//   FLASHBOTS_ENDPOINT: string,
//   CHAIN_ID: number,
//   ETHER: BigNumber,
//   GWEI: BigNumber,
//   wallet: Wallet,
//   to: string,
//   data: string,
// ) => {
//   const flashbotsProvider = await FlashbotsBundleProvider.create(
//     provider,
//     Wallet.createRandom(),
//     FLASHBOTS_ENDPOINT,
//   );

//   provider.on('block', async (blockNumber) => {
//     console.log(blockNumber);

//     const bundleSubmitResponse = await flashbotsProvider.sendBundle(
//       [
//         {
//           transaction: {
//             chainId: CHAIN_ID,
//             type: 2,
//             value: (ETHER.toBigInt() / 100n) * 3n,
//             data, // data: '0x1249c58b',
//             maxFeePerGas: GWEI.toBigInt() * 3n,
//             maxPriorityFeePerGas: GWEI.toBigInt() * 2n,
//             to, // '0x20EE855E43A7af19E407E39E5110c2C1Ee41F64D',
//           },
//           signer: wallet,
//         },
//       ],
//       blockNumber + 1,
//     );

//     // By exiting this function (via return) when the type is detected as a
//     // "RelayResponseError", TypeScript recognizes bundleSubmitResponse must be
//     // a success type object (FlashbotsTransactionResponse) after the if block.
//     if ('error' in bundleSubmitResponse) {
//       console.warn(bundleSubmitResponse.error.message);
//       return;
//     }

//     console.log(await bundleSubmitResponse.simulate());
//   });
// };

// export default sendFlashbotsBundle;
