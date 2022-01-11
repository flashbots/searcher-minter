/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import fetch from 'cross-fetch';
import { createFlashbotsProvider } from '../src/flashbots';
import {
  configure,
} from '../src/utils';

const readline = require('readline');
const { Worker } = require('worker_threads');

require('dotenv').config();

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// !!                                 !! //
// !!   BEFORE RUNNING THIS SCRIPT,   !! //
// !!   MAKE SURE TO CONFIGURE        !! //
// !!   ENVIRONMENT VARIABLES         !! //
// !!                                 !! //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

console.log('Yobot Searcher starting...');

// ** Global State ** //
const mintSignatures: string[] = [];

// ** Webhook Body Helper ** //
const params = (content: string) => {
  return JSON.stringify({
    username: 'YOBOT SEARCHER',
    avatar_url: '',
    content,
  });
};

// ** Helper function to send discord notification ** //
const postDiscord = (url: string, body: string) => {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body,
  }).then((res: any) => {
    console.log('Sent Discord Notification:', body);
  });
};

// ** CLI Helper ** //
const enterCommand = (url: string, rl: any) => {
  rl.question('Enter command or "help" for a list of commands:\n', (input: any) => {
    const cmd = input.split(' ')[0];
    const args = input.split(' ').slice(1);
    if (cmd === 'exit') {
      postDiscord(url, params('CLI Exited!'));
      rl.close();
    } else if (cmd === 'help') {
      console.log('Available commands:');
      console.log('   ├─ mintsig-add: Add a new mint signature to attempt to mint from');
      console.log('   └─ help: Prints this message');
    } else if (cmd === 'mintsig-add') {
      args.map((arg: string) => mintSignatures.push(arg));
    }
    // ** Continue the loop ** //
    enterCommand(url, rl);
  });
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
  let mintingLocked = false;

  // ** Create the Blocknative Mempool Listner Worker ** //
  const mempoolWorker = new Worker('./src/threads/Mempool.js');

  mempoolWorker.on('message', (result: any) => {
    transactionCount += 1;
    console.log('-----------------------------------------');
    console.log(`[${transactionCount}] [${result.direction.toUpperCase()}] Transaction Received by Mempool Worker`);
    console.log(`   ├─ Status: ${result.status}`);
    console.log(`   ├─ From: ${result.from}`);
    console.log(`   ├─ To: ${result.to}`);
    console.log(`   ├─ Gas Price: ${result.gasPrice}`);
    console.log(`   ├─ Gas Price Gwei: ${result.gasPriceGwei}`);
    console.log(`   ├─ Gas Used: ${result.gasUsed}`);
    console.log(`   ├─ Timestamp: ${result.timestamp}`);
    console.log(`   └─ Network: ${result.network}`);
    console.log('-----------------------------------------');

    if (!mintingLocked) {
      mintingLocked = true;
      console.log('Minting not locked, proceeding to mint...');

      // ** Check how many we minted and filter those out of verified orders starting with most expensive bid ** //
      // ** Filter out orders that are not profitable... ie: priceInWeiEach < gas price + mint cost ** //

      // ** Now, we have a list of profitable orders we want to mint for ** //
      // ** Check how many we can mint (MAX_SUPPLY - totalSupply) ** //
      // ** Include x number in bundle ** //
      // ** Simulate Bundle ** //

      // ** Send Bundle to Flashbots ** //

      // ** Record how many we minted ** //
    }
  });

  mempoolWorker.on('error', (error: any) => {
    console.error('Mempool Worker Errored!');
    console.error(error);
    postDiscord(discordWebhookUrl, params('Mempool Worker Errored!'));
  });

  mempoolWorker.on('exit', (exitCode: any) => {
    console.warn('Mempool Worker Exited!');
    console.warn(exitCode);
    postDiscord(discordWebhookUrl, params('Mempool Worker Exited!'));
  });

  // ** Create the Yobot Orders Listner Worker ** //
  const ordersWorker = new Worker('./src/threads/Orders.js');

  ordersWorker.on('message', (result: any) => {
    orderUpdateCount += 1;
    verifiedOrders = result.orders;
    console.log('got verified orders:', verifiedOrders);
    console.log(`  [${orderUpdateCount}] Order Update - ${result.orders.length} open orders on block ${result.blockNumber}`);
  });

  ordersWorker.on('error', (error: any) => {
    console.error('Orders Worker Errored!');
    console.error(error);
    postDiscord(discordWebhookUrl, params('Orders Worker Errored!'));
  });

  ordersWorker.on('exit', (exitCode: any) => {
    console.warn('Orders Worker Exited!');
    console.warn(exitCode);
    postDiscord(discordWebhookUrl, params('Orders Worker Exited!'));
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

  // ** Eat User Input ** //
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('close', () => {
    enterCommand(discordWebhookUrl, rl);
  });
  enterCommand(discordWebhookUrl, rl);
})();
