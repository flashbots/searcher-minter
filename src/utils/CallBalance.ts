/* eslint-disable import/prefer-default-export */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable spaced-comment */
import { AlchemyProvider, InfuraProvider } from '@ethersproject/providers';
import { Contract } from 'ethers';

// ** ///////////////////////////////// ** //
// **           BALANCE UTILS           ** //
// ** ///////////////////////////////// ** //

// ** Attempts to call balanceOf on a given contract address ** //
const callBalance = async (
  contract: string,
  address: string,
  provider: InfuraProvider | AlchemyProvider,
) => {
  const mintContract = new Contract(contract, ['function balanceOf(address) public view returns (uint256)'], provider);
  const [balance] = await mintContract.functions.balanceOf(address);
  return balance;
};

export {
  callBalance,
};
