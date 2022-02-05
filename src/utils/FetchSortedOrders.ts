/* eslint-disable no-underscore-dangle */
import { BaseProvider } from '@ethersproject/providers';

import { filterEvents, fetchAllERC721LimitOrderEvents, fetchLatestOrders } from '.';

// ** Maps tokenAddress => array of orders sorted from highest to lowest price offered ** //
const fetchSortedOrders = async (
  ERC721LimitOrderContract: any,
  filterStartBlock: number,
  provider: BaseProvider,
  ERC721LimitOrderInterface: any,
) => {
  // ** Get all ERC721LimitOrder events ** //
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

  // ** Return the orders mapping ** //
  return orders;
};

export default fetchSortedOrders;
