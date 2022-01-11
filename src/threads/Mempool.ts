/* eslint-disable no-console */
import { listenNewBlocksBlocknative } from '..';

const { parentPort } = require('worker_threads');

// ** Callback when a transaction is received ** //
const handleTransaction = (event: any) => {
  const {
    // ** transaction object ** //
    transaction,
    // ** data that is returned from the transaction event listener defined on the emitter ** //
    // emitterResult,
  } = event;

  // const { emitter } = sdk.transaction(transaction);

  if (transaction.status === 'confirmed') {
    // ** Send a Message Back to the parent thread ** //
    parentPort.postMessage(transaction);
  } else {
    console.log(`Got Transaction with status: ${transaction.status}`);
  }
};

parentPort.on('message', async (data: any) => {
  if (data.type === 'start') {
    // ** Start Blocknative Mempool Listner ** //

    // ** Initialize BlockNative Mempool Listner ** //
    await listenNewBlocksBlocknative(
      data.MINTING_CONTRACT,
      data.CHAIN_ID,
      handleTransaction,
    );
  }
});
