/* eslint-disable spaced-comment */

////** ///////////////////////////////** ///
/// **           ORDER UTILS          ** ///
////** ///////////////////////////////** ///

// ** Helper to parse the Order Struct ** //
const parseOrder = (order: any) => ({
  owner: order[0].toString(),
  tokenAddress: order[1].toString(),
  priceInWeiEach: parseInt(order[2].toString(), 10),
  quantity: parseInt(order[3].toString(), 10),
  num: parseInt(order[4].toString(), 10),
});

// ** Helper to validate the Order ** //
const validateOrder = (order: any) => (
  order.tokenAddress !== '0x0000000000000000000000000000000000000000'
  && order.priceInWeiEach !== 0
  && order.quantity !== 0
  && order.owner !== '0x0000000000000000000000000000000000000000'
);

// ** Calls the function `viewUserOrder` with the user's address and a given order number ** //
const callOrder = async (
  ERC721LimitOrderContract: any,
  orderNum: number,
  user: string,
) => {
  const order = await ERC721LimitOrderContract.viewUserOrder(user, orderNum);
  return order;
};

// ** Calls the function `viewUserOrders` with the user's address ** //
const callOrders = async (
  ERC721LimitOrderContract: any,
  user: string,
) => {
  const orders = await ERC721LimitOrderContract.viewUserOrders(user);
  return orders.map(parseOrder).filter(validateOrder);
};

// ** Calls the function `viewMultipleOrders` with a list of user addresses ** //
const callMultipleOrders = async (
  ERC721LimitOrderContract: any,
  users: string[],
) => {
  const orders = await ERC721LimitOrderContract.viewUserOrders(users);
  return orders;
};

export {
  parseOrder,
  callOrder,
  callOrders,
  callMultipleOrders,
};
