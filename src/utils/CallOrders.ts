const callOrders = async (
  ERC721LimitOrderContract: any,
  // parameters for the contract viewOrder() function //
  tokenAddress: any,
  user: any,
) => {
  const order = await ERC721LimitOrderContract.viewOrder(user, tokenAddress);
  return order;
};

export default callOrders;
