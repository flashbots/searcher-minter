import { providers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

const callOrders = async function (
  ERC721LimitOrderContract: any,
  // parameters for the contract viewOrder() function //
  tokenAddress: any,
  user: any,
) {
  console.log("Calling callOrder with tokenAddress:", tokenAddress, "and user:", user);
  let order = await ERC721LimitOrderContract.viewOrder(user, tokenAddress);
  return order;
};

export default callOrders;
