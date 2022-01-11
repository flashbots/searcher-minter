/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import fetch from 'cross-fetch';
import { createFlashbotsProvider } from '../src/flashbots';
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

const params = (content: string) => {
  return {
    username: 'YOBOT SEARCHER',
    avatar_url: '',
    content,
  };
};

(async () => {
  // ** Get Configuration ** //
  const {
    CHAIN_ID,
    provider,
    flashbotsEndpoint,
    wallet,
    BLOCKS_TILL_INCLUSION: blocksUntilInclusion,
    LEGACY_GAS_PRICE: legacyGasPrice,
    PRIORITY_FEE: priorityFee,
    YobotInfiniteMintInterface: yobotInfiniteMintInterface,
    MINTING_CONTRACT: infiniteMint,
    DISCORD_WEBHOOK_URL: discordWebhookUrl,
  } = configure();

  // ** Create Flashbots Provider ** //
  const fbp = await createFlashbotsProvider(
    provider,
    flashbotsEndpoint,
    wallet,
  );

  // ** STATE ** //
  let orderUpdateCount = 0;
  let transactionCount = 0;
  let verifiedOrders = [];

  // ** Create the Blocknative Mempool Listner Worker ** //
  const mempoolWorker = new Worker('./src/threads/Mempool.js');

  mempoolWorker.on('message', (result: any) => {
    transactionCount += 1;

    // !! TODO: here is where we want to mint using the open bids !! //
    // TODO: probably want to ignore our own confirmed transactions

    console.log('-----------------------------------------');
    console.log(`[${transactionCount}] [${result.direction.toUpperCase()}] Transaction`);
    console.log(`   ├─ Status: ${result.status}`);
    console.log(`   ├─ From: ${result.from}`);
    console.log(`   ├─ To: ${result.to}`);
    console.log(`   ├─ Gas Price: ${result.gasPrice}`);
    console.log(`   ├─ Gas Price Gwei: ${result.gasPriceGwei}`);
    console.log(`   ├─ Gas Used: ${result.gasUsed}`);
    console.log(`   ├─ Timestamp: ${result.timestamp}`);
    console.log(`   └─ Network: ${result.network}`);
    console.log('-----------------------------------------');
  });

  mempoolWorker.on('error', (error: any) => {
    console.error('Mempool Worker Errored!');
    console.error(error);
    fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(params('Mempool Worker Errored!')),
    }).then((res: any) => {
      console.log('Sent Discord Notification that Mempool Worker Errored');
    });
  });

  mempoolWorker.on('exit', (exitCode: any) => {
    console.warn('Mempool Worker Exited!');
    console.warn(exitCode);
    fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(params('Mempool Worker Exited!')),
    }).then((res: any) => {
      console.log('Sent Discord Notification that Mempool Worker Exited');
    });
  });

  // ** Create the Yobot Orders Listner Worker ** //
  const ordersWorker = new Worker('./src/threads/Orders.js');

  ordersWorker.on('message', (result: any) => {
    orderUpdateCount += 1;
    verifiedOrders = result.orders;
    console.log(`  [${orderUpdateCount}] Order Update - ${result.orders.length} open orders on block ${result.blockNumber}`);
  });

  ordersWorker.on('error', (error: any) => {
    console.error('Orders Worker Errored!');
    console.error(error);
    fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(params('Orders Worker Errored!')),
    }).then((res: any) => {
      console.log('Sent Discord Notification that Orders Worker Errored');
    });
  });

  ordersWorker.on('exit', (exitCode: any) => {
    console.warn('Orders Worker Exited!');
    console.warn(exitCode);
    fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(params('Orders Worker Exited!')),
    }).then((res: any) => {
      console.log('Sent Discord Notification that Orders Worker Exited');
    });
  });

  // ** Start Both Workers ** //
  mempoolWorker.postMessage({
    type: 'start',
    MINTING_CONTRACT: infiniteMint,
    CHAIN_ID,
  });
  ordersWorker.postMessage({
    type: 'start',
  });
})();
