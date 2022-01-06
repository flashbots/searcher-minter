/* eslint-disable no-underscore-dangle */
// ** Parse through events and returns orders for token addresses ** //
const fetchLatestOrders = (eventsForTokenAddress: any[], tokenAddress: string) => {
  const eventsInReversedOrder = eventsForTokenAddress.reverse();
  const ordersMap = new Map();
  const orders: any[] = [];

  eventsInReversedOrder.forEach((event) => {
    const userOrder = {
      user: event.args._user,
      priceInWeiEach: event.args._priceInWeiEach,
      quantity: event.args._quantity,
      tokenAddress,
    };

    // ** ORDER_CANCELLED events ** //
    if (event.args._action === 'ORDER_CANCELLED') {
      if (ordersMap.has(event.args._user)) {
        ordersMap.delete(event.args._user);
      }
    }

    // ** Append ORDER_PLACED events to the orders map ** //
    if (event.args._action === 'ORDER_PLACED') {
      ordersMap.set(event.args._user, true);
      orders.push(userOrder);
    }
  });

  return orders;
};

export default fetchLatestOrders;
