/* eslint-disable no-console */
import { FlashbotsBundleProvider, FlashbotsBundleRawTransaction, FlashbotsBundleTransaction } from '@flashbots/ethers-provider-bundle';
import { BaseProvider } from '@ethersproject/providers';
import { BigNumber, Wallet } from 'ethers';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TransactionRequest } from '@ethersproject/abstract-provider';

const craftTransaction = async (
  provider: BaseProvider,
  wallet: Wallet,
  chainId: number,
  blocks_until_inclusion: number,
  legacy_gas_price: BigNumber,
  priority_fee: BigNumber,
  // !! NOTE: a gasLimit equal to 0 will result in using the previous block's gasLimit !! //
  gasLimit: BigNumber,
  to: string,
  data: string,
  value: BigNumber,
): Promise<FlashbotsBundleTransaction | FlashbotsBundleRawTransaction> => {
  const currentBlockNumber = await provider.getBlockNumber();

  const block = await provider.getBlock(currentBlockNumber);

  const legacyTransaction = {
    to,
    gasPrice: legacy_gas_price,
    gasLimit: gasLimit.gt(0) ? gasLimit : block.gasLimit,
    data,
    nonce: await provider.getTransactionCount(wallet.address),
    value,
  };

  let eip1559Transaction: TransactionRequest;
  if (block.baseFeePerGas == null) {
    console.warn('This chain is not EIP-1559 enabled, defaulting to two legacy transactions for demo');
    eip1559Transaction = { ...legacyTransaction };
    // We set a nonce in legacyTransaction above to limit validity to a single landed bundle.
    // Delete that nonce for tx#2, and allow bundle provider to calculate it
    delete eip1559Transaction.nonce;
  } else {
    const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
      block.baseFeePerGas,
      blocks_until_inclusion,
    );
    eip1559Transaction = {
      to,
      type: 2,
      maxFeePerGas: priority_fee.add(maxBaseFeeInFutureBlock),
      maxPriorityFeePerGas: priority_fee,
      gasLimit: gasLimit.gt(0) ? gasLimit : block.gasLimit.sub(block.gasLimit.div(20)),
      data,
      chainId,
      value,
    };
  }

  return {
    signer: wallet,
    transaction: eip1559Transaction,
  };
};

export default craftTransaction;
