/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { providers, Wallet } from 'ethers';
import * as ethers from 'ethers';

import {
  configure,
  fetchAllERC721LimitOrderEvents,
  // sendFlashbotsBundle,
} from '../src/utils';
import { listenNewBlocksBlocknative } from '../src/mempool';

require('dotenv').config();

console.log('Yobot Searcher starting...');

const { provider, YobotERC721LimitOrderContract, YobotERC721LimitOrderInterface } = configure();

// ** Filter From Block Number ** //
const filterStartBlock = 0;

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// !!                                 !! //
// !!   BEFORE RUNNING THIS SCRIPT,   !! //
// !!   MAKE SURE TO CONFIGURE        !! //
// !!   ENVIRONMENT VARIABLES         !! //
// !!                                 !! //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

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

    // TODO: Submit a mint transaction
  }
};

// ** Main Function ** //
async function main() {
  // ** Get Configuration ** //
  const {
    MINTING_CONTRACT,
    CHAIN_ID,
  } = configure();

  // ** Initialize BlockNative Mempool Listner ** //
  await listenNewBlocksBlocknative(
    MINTING_CONTRACT,
    CHAIN_ID,
    handleTransaction,
  );
}

main();
