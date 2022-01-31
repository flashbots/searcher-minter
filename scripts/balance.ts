/* eslint-disable no-console */

import {
  callBalance,
  configure,
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
}

main();
