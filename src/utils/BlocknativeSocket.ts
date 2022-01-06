const Blocknative = require('bnc-sdk')

require('dotenv').config();

// ** Callback when a transaction is received ** //
const handleTransaction = (event: any) => {
  const {
    transaction, // ** transaction object **
    emitterResult // ** data that is returned from the transaction event listener defined on the emitter **
  } = event;

  // const {
  //   emitter
  // } = sdk.transaction(transaction);

  console.log(transaction);
  console.log(`Transaction status: ${transaction.status}`);

  if(transaction.status === 'confirmed') {
    console.log(`Transaction ${transaction} confirmed`);
    console.log("Sending flashbots bundle...");

    // TODO: Submit a mint transaction
  }
}


const listenNewBlocksBlocknative = async (
  address: string,
  chain_id: string | number // chain id can be parsed as a network name or chain number
) => {

  const options = {
    dappId: process.env.BLOCKNATIVE_API_KEY,
    networkId: chain_id,
    // system: 'ethereum', // defaults to ethereum
    ws: WebSocket,
    name: 'Yobot Searcher', // optional use for managing multiple instances
    transactionHandlers: [handleTransaction],
    onerror: (error: any) => {console.log("BlockNative SDK ERROR:", error)} // optional, use to catch errors
  }

  // YobotERC721LimitOrderContractAddress
  const AttachedAddress = "0x3b4a7f92ee992ffb71ddd367f2702fbaa3d64f4b";

  console.log("Instantiating Blocknative SDK...");
  const sdk = new Blocknative(options);
  await sdk.configuration({
    scope: address, // [required] - either 'global' or valid Ethereum address
    // abi: {}, // [optional] - valid contract ABI
    // filters: [
    //   { from:  process.env.CONTRACT_ADMIN_ADDRESS },
    //   { "contractCall.methodName": "flipSaleState" },
    //   { status: "pending" }
    // ],
    watchAddress: true // [optional] - Whether the server should automatically watch the "scope" value if it is an address
  })

}