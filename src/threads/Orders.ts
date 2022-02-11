/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import {
  callOrders,
  compareOrderEvents,
  configure,
  fetchSortedOrders,
} from '..';

const {
  parentPort: orderWorkerParent,
} = require('worker_threads');

const {
  provider,
  YobotERC721LimitOrderContract: yobotERC721LimitOrderContract,
  YobotERC721LimitOrderInterface: yobotERC721LimitOrderInterface,
} = configure();

const getOrders = async (blockNumber: number) => {
  // ** Fetch Sorted Orders ** //
  const events = await fetchSortedOrders(
    yobotERC721LimitOrderContract,
    0, // filterStartBlock
    provider,
    yobotERC721LimitOrderInterface,
  );

  // ** Memoize user deposits ** //
  const userOrders: any = {};

  // ** Iterate mapping ** //
  const eventArray: any = [];
  events.forEach((orderList, token) => eventArray.push({ token, orderList }));

  const verifiedOrders = [];

  for (const { token, orderList } of eventArray) {
    // let { token, orders } = obj;
    // ** Iterate orders ** //
    for (const order of orderList) {
      let fetchedOrders = userOrders[order.user];
      if (!(order.user in userOrders)) {
        console.log('[MEMOIZE] Calling orders for user:', order.user);
        // eslint-disable-next-line no-await-in-loop
        fetchedOrders = await callOrders(
          yobotERC721LimitOrderContract,
          order.user,
        );
        userOrders[order.user] = fetchedOrders;
      }
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
  orderWorkerParent.postMessage({
    orders: verifiedOrders,
    blockNumber,
  });
};

orderWorkerParent.on('message', async (data: any) => {
  if (data.type === 'start') {
    // ** Listen to new blocks ** //
    provider.on('block', async (blockNumber: number) => {
      await getOrders(blockNumber);
    });
    // ** Manually trigger first block ** //
    const currentBlockNumber = await provider.getBlockNumber();
    await getOrders(currentBlockNumber);
  }
});
