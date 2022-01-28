/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

import { BigNumber } from 'ethers';
import {
  callBalance,
  callOrders,
  compareOrderEvents,
  configure,
  fetchSortedOrders,
  fillOrder,
} from '../src/utils';

require('dotenv').config();

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// !!                                 !! //
// !!   THIS FILLS ALL ORDERS         !! //
// !!   REGARDLESS OF PROFITABILITY   !! //
// !!                                 !! //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

console.log('Filling Open Orders...');

const sortOrders = (verifiedOrders: any[]) => {
  // ** Try to parse verified orders as big numbers ** //
  verifiedOrders.sort((a, b) => {
    console.log('a.priceInWeiEach:', a.priceInWeiEach);
    console.log('b.priceInWeiEach:', b.priceInWeiEach);

    // ** Parse strings as big numbers ** //
    const bp = BigNumber.from(b.priceInWeiEach);
    const ap = BigNumber.from(a.priceInWeiEach);
    console.log('a.priceInWeiEach:', ap);
    console.log('b.priceInWeiEach:', bp);

    return bp.sub(ap).gt(1) ? 1 : -1;
  });

  return verifiedOrders;
};

// ** Main Function ** //
async function main() {
  // ** Configure ** //
  const {
    provider,
    YobotERC721LimitOrderContract,
    YobotERC721LimitOrderInterface,
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
  const allEvents = await fetchAllERC721LimitOrderEvents(
    ERC721LimitOrderContract,
    filterStartBlock,
    provider,
    ERC721LimitOrderInterface,
  );

  // ** Get a Set of Token Addresses ** //
  const tokenAddresses = Array.from(new Set(allEvents.map((
    event,
  ) => event.args._tokenAddress.toString())));
  const orders = new Map();

  // ** For each Token Address ** //
  tokenAddresses.map((tokenAddress) => {
    // ** Get all ERC721LimitOrder events for that Token Address ** //
    const eventsForTokenAddress = filterEvents(tokenAddress, allEvents);

    // ** Get the latest orders given those events ** //
    const latestOrders = fetchLatestOrders(eventsForTokenAddress, tokenAddress);

    // ** Sort the orders by price offered ** //
    const sortedOrders = latestOrders.sort((a, b) => a.priceInWeiEach.gt(b.priceInWeiEach));
    orders.set(tokenAddress, sortedOrders);

    return '';
  });
}

main();
