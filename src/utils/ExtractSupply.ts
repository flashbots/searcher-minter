/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { InfuraProvider } from '@ethersproject/providers';
import { Contract } from 'ethers';

const potentialTotalSupplyAbis = [
  'function totalSupply() public view returns (uint256)',
  'function totalSupply() public constant returns (uint256)',
  'function total_supply() public view returns (uint256)',
  'function total_supply() public constant returns (uint256)',
  'function supply() public view returns (uint256)',
  'function supply() public constant returns (uint256)',
];

const potentialMaxSupplyAbis = [
  'function totalSupply() public view returns (uint256)',
  'function totalSupply() public constant returns (uint256)',
  'function total_supply() public view returns (uint256)',
  'function total_supply() public constant returns (uint256)',
  'function supply() public view returns (uint256)',
  'function supply() public constant returns (uint256)',
];

const extractTotalSupplies = async (
  address: string,
  provider: InfuraProvider,
  knownAbi?: string,
) => {
  let totalSupply = 0;
  let successfulAbi: string = '';

  // ** If we have a known ABI, let's use it to get the mint price! ** //
  if (typeof knownAbi !== 'undefined') {
    try {
      const mintContract = new Contract(address, [knownAbi], provider);
      // TODO: change this from `publicSalePrice` to the function name
      totalSupply = await mintContract.publicSalePrice();
      successfulAbi = knownAbi;
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  for (const abi of potentialTotalSupplyAbis) {
    try {
      const mintContract = new Contract(address, [abi], provider);
      // TODO: change this from `publicSalePrice` to the function name
      totalSupply = await mintContract.publicSalePrice();
      successfulAbi = abi;
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
  let maxSupply = 0;
  let successfulAbi: string = '';

  // ** If we have a known ABI, let's use it to get the mint price! ** //
  if (typeof knownAbi !== 'undefined') {
    try {
      const mintContract = new Contract(address, [knownAbi], provider);
      // TODO: change this from `publicSalePrice` to the function name
      maxSupply = await mintContract.publicSalePrice();
      successfulAbi = knownAbi;
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  for (const abi of potentialMaxSupplyAbis) {
    try {
      const mintContract = new Contract(address, [abi], provider);
      // TODO: change this from `publicSalePrice` to the function name
      maxSupply = await mintContract.publicSalePrice();
      successfulAbi = abi;
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
