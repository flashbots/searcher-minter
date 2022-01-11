/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import {
  configure,
} from '../src/utils';

const { Worker } = require('worker_threads');

require('dotenv').config();

console.log('Yobot Searcher starting...');

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// !!                                 !! //
// !!   BEFORE RUNNING THIS SCRIPT,   !! //
// !!   MAKE SURE TO CONFIGURE        !! //
// !!   ENVIRONMENT VARIABLES         !! //
// !!                                 !! //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

(async () => {
  // ** Get Configuration ** //
  const {
    MINTING_CONTRACT,
    CHAIN_ID,
  } = configure();

  // ** Create the Blocknative Mempool Listner Worker ** //
  const mempoolWorker = new Worker('./src/threads/Mempool.js');

  console.log('Created Mempool Worker:', mempoolWorker);

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
  const ordersWorker = new Worker('./src/threads/Orders.js');

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

  // ** Start Both Workers ** //
  mempoolWorker.postMessage({
    type: 'start',
    MINTING_CONTRACT,
    CHAIN_ID,
  });
  ordersWorker.postMessage({
    type: 'start',
  });
})();
