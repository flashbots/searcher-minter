/* eslint-disable no-console */

import { listenNewBlocksBlocknative } from '../src/mempool';
import {
  configure,
} from '../src/utils';

require('dotenv').config();

// ** ///////////////////////////////////////// ** //
// **                                           ** //
// **    LISTENS TO THE MEMPOOL TX FOR ERC721   ** //
// **                                           ** //
// ** ///////////////////////////////////////// ** //

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
    console.log('✅ TX CONFIRMED ✅');
    console.log(`HEARD TX: ${transaction}`);
  } else {
    console.log('🕸️ TX WHISPERED 🕸️');
    console.log(`TX Status: ${transaction.status}`);
  }
};

// ** Main Function ** //
async function main() {
  // ** Configure ** //
  const {
    CHAIN_ID,
    MINTING_CONTRACT,
  } = configure();

  const addresses = [MINTING_CONTRACT];
  console.log('Listening to the mempool fox transactions with addresses:', addresses);

  // ** Initialize BlockNative Mempool Listner ** //
  await listenNewBlocksBlocknative(
    MINTING_CONTRACT,
    CHAIN_ID,
    handleTransaction,
  );
}

main();
