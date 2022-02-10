/* eslint-disable no-console */

import {
  callBalance,
  configure,
  fetchMintingEvents,
} from '../src/utils';

require('dotenv').config();

// ** Configure ** //
const {
  provider,
  EOA_ADDRESS,
  MINTING_CONTRACT,
} = configure();

const fetchBalanceAndTokens = async () => {
  // ** Fetch the Balance of the searcher ** //
  const balance = await callBalance(
    MINTING_CONTRACT,
    EOA_ADDRESS,
    provider,
  );
  console.log('BigNumber Balance:', balance);
  console.log('Decimal Balance:', parseInt(balance.toString(), 10));

  // ** Get all ERC721 Contract Events ** //
  const mintingEvents = await fetchMintingEvents(
    MINTING_CONTRACT,
    0, // filterStartBlock
    provider,
    EOA_ADDRESS,
  );
  const tokens = mintingEvents.map((e: any) => e.id);
  console.log('Wallet has tokens:', tokens);
};

const INTERVAL = 15_000;

// ** Main Function ** //
async function main() {
  console.log(`Setting up inventory fetching on a ${INTERVAL / 1000} second interval...`);
  // ** Fatch Balance and tokens on a 10 second interval ** //
  setInterval(async () => {
    await fetchBalanceAndTokens();
  }, INTERVAL);
  await fetchBalanceAndTokens();
}

main();
