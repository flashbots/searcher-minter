import { providers, Wallet } from "ethers";
import * as ethers from "ethers"

import {
  DeployedContracts,
  sendFlashbotsBundle
} from "./utils";

require('dotenv').config();

// ** Default to Goerli if no chain id provided **
const CHAIN_ID = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : 5;
const provider = new providers.InfuraProvider(CHAIN_ID)

const FLASHBOTS_ENDPOINT = "https://relay-goerli.flashbots.net";

// ** We need the WALLET PRIVATE KEY **
if (process.env.WALLET_PRIVATE_KEY === undefined) {
  console.error("Please provide WALLET_PRIVATE_KEY env")
  process.exit(1)
}

const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, provider)

// ** Import the Abis **
const YobotERC721LimitOrderAbi = require("src/abi/YobotERC721LimitOrderAbi.json");
const YobotArtBlocksBrokerAbi = require("src/abi/YobotArtBlocksBrokerAbi.json");

// ** Instantiate Contracts and Interfaces **
const YobotERC721LimitOrderInterface = new ethers.utils.Interface(YobotERC721LimitOrderAbi)
const YobotERC721LimitOrderContract = new ethers.Contract(DeployedContracts[CHAIN_ID]["YobotERC721LimitOrder"], YobotERC721LimitOrderAbi, provider)

const YobotArtBlocksBrokerInterface = new ethers.utils.Interface(YobotArtBlocksBrokerAbi)
const YobotArtBlocksBrokerContract = new ethers.Contract(DeployedContracts[CHAIN_ID]["YobotArtBlocksBroker"], YobotArtBlocksBrokerAbi, provider)

// ** ethers.js can use Bignumber.js class OR the JavaScript-native bigint **
// ** I changed this to bigint as it is MUCH easier to deal with **
const GWEI: bigint = 10n ** 9n;
const ETHER: bigint = 10n ** 18n;

// ** Filter From Block Number **
const filterStartBlock = 13097324;




// ** Main Function **
async function main() {
  
  // await sendFlashbotsBundle(
  //   provider,
  //   FLASHBOTS_ENDPOINT,
  //   CHAIN_ID,
  //   ETHER,
  //   GWEI,
  //   wallet,
  // );
}

// main();