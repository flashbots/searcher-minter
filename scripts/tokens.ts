/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

// import { BigNumber } from 'ethers';
import {
  callBalance,
  configure,
  fetchMintingEvents,
} from '../src/utils';

require('dotenv').config();

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// !!                                 !! //
// !!   THIS FILLS ALL ORDERS         !! //
// !!   REGARDLESS OF PROFITABILITY   !! //
// !!                                 !! //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

console.log('Fetching token ids...');

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

  console.log('Fetching ERC721 events');
  console.log('Using EOA Address:', EOA_ADDRESS);

  // ** Get all ERC721 Contract Events ** //
  const mintingEvents = await fetchMintingEvents(
    MINTING_CONTRACT,
    0, // filterStartBlock
    provider,
    EOA_ADDRESS,
  );

  console.log('Minting events:', mintingEvents);

  // // ** Get a Set of Token Addresses ** //
  // const tokenAddresses = Array.from(new Set(allEvents.map((
  //   event,
  // ) => event.args._tokenAddress.toString())));
  // const orders = new Map();

  // // ** For each Token Address ** //
  // tokenAddresses.map((tokenAddress) => {
  //   // ** Get all ERC721LimitOrder events for that Token Address ** //
  //   const eventsForTokenAddress = filterEvents(tokenAddress, allEvents);

  //   // ** Get the latest orders given those events ** //
  //   const latestOrders = fetchLatestOrders(eventsForTokenAddress, tokenAddress);

  //   // ** Sort the orders by price offered ** //
  //   const sortedOrders = latestOrders.sort((a, b) => a.priceInWeiEach.gt(b.priceInWeiEach));
  //   orders.set(tokenAddress, sortedOrders);

  //   return '';
  // });
}

main();
