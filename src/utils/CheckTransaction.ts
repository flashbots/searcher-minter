/* eslint-disable no-console */
import { BaseProvider } from '@ethersproject/providers';

const checkTxn = async (
  txnHash: string,
  provider: BaseProvider,
) => {
  const fetchedTxn = await provider.getTransaction(txnHash);
  if (fetchedTxn) {
    if (fetchedTxn.blockNumber) {
      console.log('fetchedTxn: ');
      console.log(fetchedTxn);
      return true;
    }
  }

  return false;
};

export default checkTxn;
