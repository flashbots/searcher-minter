import { utils } from 'ethers';

// ** Parse through events and returns orders for token addresses ** //
const fetchLatestOrders = (
  eventsForTokenAddress: any[]
) => {
	const eventsInReversedOrder = eventsForTokenAddress.reverse()

	// ** Go through all the events, and grab the most valuable outstanding user order ** //
	// TODO: how to go through and nix ORDER_CANCELLED and ORDER_PLACED events args _action?

	const ordersMap = new Map();
	const cancelledOrdersMap = new Map();
	eventsInReversedOrder.map(event => {
    let user_order = {
      user: event.args._user,
      priceInWeiEach: event.args._priceInWeiEach,
      quantity: event.args._quantity,
      readableQuantity: event.args._quantity.toString(),
      priceInEthEach: utils.formatEther(event.args._priceInWeiEach)
    };

		// ** Memoize ORDER_CANCELLED events ** //
		if (event.args._action === "ORDER_CANCELLED") {
			let cancelled_orders = cancelledOrdersMap.get(event.args._user);
      cancelledOrdersMap.set(event.args._user, [
        user_order,
        ...(cancelled_orders ? cancelled_orders : [])
      ] || []);
		}

    // ** Append ORDER_PLACED events to the orders map ** //
		// ** Only Store the event if it is not already in the mapping ** //
		if (!ordersMap.has(event.args._user) && event.args._action === "ORDER_PLACED") {
			// ** Check that the user hasn't cancelled the order ** //
      let cancelled_orders = cancelledOrdersMap.get(event.args._user);
      cancelled_orders = cancelled_orders ? cancelled_orders : [];

      let event_exists: boolean = false;
      for (let event of cancelled_orders) {
        event_exists = event_exists || (JSON.stringify(event) == JSON.stringify(user_order));
      }

      if (!event_exists) {
        console.log("Adding order to map:", user_order);
        ordersMap.set(event.args._user, user_order);
      }
		}
	})

	const ordersArray = Array.from(ordersMap, ([, value]) => value)
	const nonZeroOrders = ordersArray.filter(order => !order.quantity.eq('0'))
	return nonZeroOrders
}

export default fetchLatestOrders;