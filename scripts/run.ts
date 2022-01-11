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

const { Worker } = require('worker_threads');

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

// ** Main Function ** //
async function main() {
  // ** Get Configuration ** //
  const {
    MINTING_CONTRACT,
    CHAIN_ID,
  } = configure();

  // ** Create the Blocknative Mempool Listner Worker ** //
  const mempoolWorker = new Worker('../src/theads/Mempool.ts');

  mempoolWorker.once('message', (result: any) => {
    console.log('Got message from the Mempool worker thread:', result);
  });

  mempoolWorker.on('error', (error: any) => {
    console.error('Mempool Worker Errored!');
    console.error(error);
  });

  mempoolWorker.on('exit', (exitCode: any) => {
    console.warn('Mempool Worker Exited!');
    console.warn(exitCode);
  });

  // ** Create the Yobot Orders Listner Worker ** //
  const ordersWorker = new Worker('../src/theads/Orders.ts');

  ordersWorker.once('message', (result: any) => {
    console.log('Got message from the orders worker thread:', result);
  });

  ordersWorker.on('error', (error: any) => {
    console.error('Orders Worker Errored!');
    console.error(error);
  });

  ordersWorker.on('exit', (exitCode: any) => {
    console.warn('Orders Worker Exited!');
    console.warn(exitCode);
  });
}

main();
