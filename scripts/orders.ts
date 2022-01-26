/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import {
  callOrders,
  compareOrderEvents,
  configure, fetchSortedOrders,
} from '../src/utils';

require('dotenv').config();

// ** orders Function ** //
async function orders() {
  console.log('Fetching outstanding bids from Yobot ERC721 Limit Order Contract...');

  // ** Configure ** //
  const {
    provider,
    YobotERC721LimitOrderContract: yobotERC721LimitOrderContract,
    YobotERC721LimitOrderInterface: yobotERC721LimitOrderInterface,
  } = configure();

  // ** Fetch Sorted Orders ** //
  const events = await fetchSortedOrders(
    yobotERC721LimitOrderContract,
    0, // filterStartBlock
    provider,
    yobotERC721LimitOrderInterface,
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
        yobotERC721LimitOrderContract,
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
}

orders();
