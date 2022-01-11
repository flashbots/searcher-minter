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

  // const {
  //   emitter
  // } = sdk.transaction(transaction);

  console.log(transaction);
  console.log(`Transaction status: ${transaction.status}`);

  if (transaction.status === 'confirmed') {
    console.log(`Transaction ${transaction} confirmed`);
    console.log('Sending flashbots bundle...');

    // ** Send a Message Back to the parent thread ** //
    parentPort.postMessage(transaction);
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
