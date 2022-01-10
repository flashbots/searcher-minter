/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { providers, Wallet } from 'ethers';
import * as ethers from 'ethers';

import {
  configure,
  fetchAllERC721LimitOrderEvents,
  // sendFlashbotsBundle,
} from 'src/utils';

require('dotenv').config();

console.log('Yobot Searcher starting...');

const { provider, YobotERC721LimitOrderContract, YobotERC721LimitOrderInterface } = configure();

// ** Filter From Block Number ** //
const filterStartBlock = 0;

// ** Main Function ** //
async function main() {
  const allEvents = await fetchAllERC721LimitOrderEvents(YobotERC721LimitOrderContract, filterStartBlock, provider, YobotERC721LimitOrderInterface);

  console.log(allEvents);
  // await sendFlashbotsBundle(
  //   provider,
  //   FLASHBOTS_ENDPOINT,
  //   CHAIN_ID,
  //   ETHER,
  //   GWEI,
  //   wallet,
  // );
}

main();
