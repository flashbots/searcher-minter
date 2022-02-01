/* eslint-disable no-console */

import {
  callBalance,
  configure,
  fetchMintingEvents,
} from '../src/utils';

require('dotenv').config();

console.log('Fethcing the ERC721 Balance...');

// ** Main Function ** //
async function main() {
  // ** Configure ** //
  const {
    provider,
    EOA_ADDRESS,
    MINTING_CONTRACT,
  } = configure();

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
}

main();
