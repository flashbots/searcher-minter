/* eslint-disable no-console */
import WebSocket from 'ws';

const Blocknative = require('bnc-sdk');

require('dotenv').config();

const listenNewBlocksBlocknative = async (
  address: string,
  chain_id: string | number, // chain id can be parsed as a network name or chain number
  tx_handler: (event: any) => void,
) => {
  const options = {
    dappId: process.env.BLOCKNATIVE_API_KEY,
    networkId: chain_id,
    // system: 'ethereum', // defaults to ethereum
    ws: WebSocket,
    name: 'Yobot Searcher', // optional use for managing multiple instances
    transactionHandlers: [tx_handler],
    onerror: (error: any) => {
      console.log('BlockNative SDK ERROR:', error);
    }, // optional, use to catch errors
  };

  // YobotERC721LimitOrderContractAddress
  // const AttachedAddress = '0x3b4a7f92ee992ffb71ddd367f2702fbaa3d64f4b';

  const sdk = new Blocknative(options);
  await sdk.configuration({
    scope: address, // [required] - either 'global' or valid Ethereum address
    // abi: {}, // [optional] - valid contract ABI
    // filters: [
    //   { from:  process.env.CONTRACT_ADMIN_ADDRESS },
    //   { "contractCall.methodName": "flipSaleState" },
    //   { status: "pending" }
    // ],
    watchAddress: true,
    // [optional] - Whether the server should automatically
    // watch the "scope" value if it is an address
  });
};

export default listenNewBlocksBlocknative;
