/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { InfuraProvider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';

const potentialTotalSupplyAbis = [
  ['totalSupply', 'function totalSupply() public view returns (uint256)'],
  ['totalSupply', 'function totalSupply() public constant returns (uint256)'],
  ['total_supply', 'function total_supply() public view returns (uint256)'],
  ['total_supply', 'function total_supply() public constant returns (uint256)'],
  ['supply', 'function supply() public view returns (uint256)'],
  ['supply', 'function supply() public constant returns (uint256)'],
  ['tokenCount', 'function tokenCount() public view returns (uint256)'],
  ['tokenCount', 'function tokenCount() public constant returns (uint256)'],
];

const potentialMaxSupplyAbis = [
  ['MAXIMUM_COUNT', 'function MAXIMUM_COUNT() public view returns (uint256)'],
  ['MAXIMUM_COUNT', 'function MAXIMUM_COUNT() public constant returns (uint256)'],
  ['MAXIMUM', 'function MAXIMUM() public view returns (uint256)'],
  ['MAXIMUM', 'function MAXIMUM() public constant returns (uint256)'],
  ['MAX_COUNT', 'function MAX_COUNT() public view returns (uint256)'],
  ['MAX_COUNT', 'function MAX_COUNT() public constant returns (uint256)'],
  ['maxCount', 'function maxCount() public view returns (uint256)'],
  ['maxCount', 'function maxCount() public constant returns (uint256)'],
  ['maxSupply', 'function maxSupply() public view returns (uint256)'],
  ['maxSupply', 'function maxSupply() public constant returns (uint256)'],
  ['MAX_SUPPLY', 'function MAX_SUPPLY() public view returns (uint256)'],
  ['MAX_SUPPLY', 'function MAX_SUPPLY() public constant returns (uint256)'],
];

const extractTotalSupplies = async (
  address: string,
  provider: InfuraProvider,
  knownAbi?: string,
) => {
  let totalSupply: BigNumber = BigNumber.from(0);
  let successfulAbi: string = '';

  // ** If we have a known ABI, let's use it to get the mint price! ** //
  if (typeof knownAbi !== 'undefined') {
    try {
      const mintContract = new Contract(address, [knownAbi], provider);
      totalSupply = await mintContract.functions[knownAbi]();
      successfulAbi = knownAbi;
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  console.log('known abi:', knownAbi);
  for (const abi of potentialTotalSupplyAbis) {
    try {
      const mintContract = new Contract(address, [abi[1]], provider);
      totalSupply = await mintContract.functions[abi[0]]();
      [,successfulAbi] = abi;
      break; // break out of the loop if we successfully call
    // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  return {
    totalSupply,
    successfulAbi,
  };
};

const extractMaxSupplies = async (
  address: string,
  provider: InfuraProvider,
  knownAbi?: string,
) => {
  let maxSupply: BigNumber = BigNumber.from(0);
  let successfulAbi: string = '';

  // ** If we have a known ABI, let's use it to get the mint price! ** //
  if (typeof knownAbi !== 'undefined') {
    try {
      const mintContract = new Contract(address, [knownAbi], provider);
      maxSupply = await mintContract.functions[knownAbi]();
      successfulAbi = knownAbi;
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  for (const abi of potentialMaxSupplyAbis) {
    try {
      const mintContract = new Contract(address, [abi[1]], provider);
      maxSupply = await mintContract.functions[abi[0]]();
      [,successfulAbi] = abi;
      break; // break out of the loop if we successfully call
    // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  return {
    maxSupply,
    successfulAbi,
  };
};

export {
  extractMaxSupplies,
  extractTotalSupplies,
};
