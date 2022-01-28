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

  // ** Fill open orders using our balance ** //

  // ** Fetch Sorted Orders ** //
  const events = await fetchSortedOrders(
    YobotERC721LimitOrderContract,
    0, // filterStartBlock
    provider,
    YobotERC721LimitOrderInterface,
  );

  // ** Iterate mapping ** //
  const eventArray: any = [];
  events.forEach((orderList, token) => eventArray.push({ token, orderList }));

  const verifiedOrders = [];

  for (const { token, orderList } of eventArray) {
    // let { token, orders } = obj;
    // ** Iterate orders ** //
    for (const order of orderList) {
      // eslint-disable-next-line no-await-in-loop
      const fetchedOrders = await callOrders(
        YobotERC721LimitOrderContract,
        order.user,
      );
      for (const fetchedOrder of fetchedOrders) {
        const contractOrderPrice = fetchedOrder.priceInWeiEach.toString();
        const contractOrderQuantity = fetchedOrder.quantity.toString();

        if (compareOrderEvents(fetchedOrder, order)) {
          const verifiedOrder = {
            token,
            user: order.user,
            priceInWeiEach: contractOrderPrice,
            quantity: contractOrderQuantity,
            orderId: order.orderId,
            orderNum: order.orderNum,
          };
          verifiedOrders.push(verifiedOrder);
        }
      }
    }
  }

  console.log('Verified Orders:', verifiedOrders);

  // ** Sort the orders in a separate function ** //
  const sortedOrders = sortOrders(verifiedOrders);

  // ** Fill The Orders ** //
  for (const order of sortedOrders) {
    console.log('Filling order with id:', order.orderId.toNumber());

    // TODO: get all searcher token ids

    fillOrder(
      YobotERC721LimitOrderContract,
      order.orderId.toNumber(), // orderId
      order.orderId.toNumber(), // tokenId
      parseInt(order.expectedPriceInWeiEach, 10), // Expected price in wei each
      EOA_ADDRESS, // profitTo
      true, // send now
    );
  }
}

main();
