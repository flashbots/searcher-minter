import { utils } from 'ethers';
const BigNumber = require('bignumber.js');

// ** Parse through events and returns orders for token addresses ** //
const fetchLatestOrders = (
  eventsForTokenAddress: any[],
  tokenAddress: string
) => {
	const eventsInReversedOrder = eventsForTokenAddress.reverse();
	const ordersMap = new Map();
  const orders: any[] = [];

	eventsInReversedOrder.forEach(event => {
    let user_order = {
      user: event.args._user,
      priceInWeiEach: event.args._priceInWeiEach,
      quantity: event.args._quantity,
      tokenAddress: tokenAddress
    };

    // ** ORDER_CANCELLED events ** //
		if (event.args._action === "ORDER_CANCELLED") {
      if (ordersMap.has(event.args._user)) {
        ordersMap.delete(event.args._user);
		  }
    }

    // ** Append ORDER_PLACED events to the orders map ** //
		if (event.args._action === "ORDER_PLACED") {
        ordersMap.set(event.args._user, true);
        orders.push(user_order);
		}
	})

	return orders;
}

export default fetchLatestOrders;