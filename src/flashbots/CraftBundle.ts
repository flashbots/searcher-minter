import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { Web3Provider, InfuraProvider } from '@ethersproject/providers';
import { BigNumber, Wallet } from "ethers";
import { TransactionRequest } from '@ethersproject/abstract-provider'


const craftBundle = async (
  provider: Web3Provider | InfuraProvider,
  flashbotsProvider: FlashbotsBundleProvider,
  wallet: Wallet,
  chain_id: number,
  blocks_until_inclusion: number,
  legacy_gas_price: BigNumber,
  priority_fee: BigNumber
): Promise<{ targetBlockNumber: number; transactionBundle: string[]; }> => {
  let currentBlockNumber = await provider.getBlockNumber()
  console.log("Got current block number:", currentBlockNumber);

  const block = await provider.getBlock(currentBlockNumber)
  console.log("Got current block:", block);

  const legacyTransaction = {
    to: wallet.address,
    gasPrice: legacy_gas_price,
    gasLimit: 21000,
    data: '0x',
    nonce: await provider.getTransactionCount(wallet.address)
  }
  console.log("Created legacy transaction:", legacyTransaction);

  let eip1559Transaction: TransactionRequest
  if (block.baseFeePerGas == null) {
    console.warn('This chain is not EIP-1559 enabled, defaulting to two legacy transactions for demo')
    eip1559Transaction = { ...legacyTransaction }
    // We set a nonce in legacyTransaction above to limit validity to a single landed bundle. Delete that nonce for tx#2, and allow bundle provider to calculate it
    delete eip1559Transaction.nonce
  } else {
    const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(block.baseFeePerGas, blocks_until_inclusion)
    eip1559Transaction = {
      to: wallet.address,
      type: 2,
      maxFeePerGas: priority_fee.add(maxBaseFeeInFutureBlock),
      maxPriorityFeePerGas: priority_fee,
      gasLimit: 21000,
      data: '0x',
      chainId: chain_id
    }
  }
  console.log("Eip1559 transaction:", eip1559Transaction);

  const signedTransactions = await flashbotsProvider.signBundle([
    {
      signer: wallet,
      transaction: legacyTransaction
    },
    {
      signer: wallet,
      transaction: eip1559Transaction
    }
  ])

  return {
    targetBlockNumber: currentBlockNumber + blocks_until_inclusion,
    transactionBundle: signedTransactions
  };
};

export default craftBundle;
