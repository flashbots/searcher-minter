/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import {
  callOrders,
  compareOrderEvents,
  configure,
  fetchSortedOrders,
} from '..';

const { parentPort } = require('worker_threads');

parentPort.on('message', async (data: any) => {
  if (data.type === 'start') {
    // ** Listen to new blocks ** //
    const {
      provider,
      YobotERC721LimitOrderContract: yobotERC721LimitOrderContract,
      YobotERC721LimitOrderInterface: yobotERC721LimitOrderInterface,
    } = configure();
    provider.on('block', async (blockNumber: number) => {
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
                orderId: order.orderId.toString(),
                orderNum: order.orderNum.toString(),
              };
              verifiedOrders.push(verifiedOrder);
            }
          }
        }
      }

      // ** Send Verified Orders to Parent Thread ** //
      parentPort.postMessage({
        orders: verifiedOrders,
        blockNumber,
      });
    });
  }
});
