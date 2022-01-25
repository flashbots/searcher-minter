/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { InfuraProvider } from '@ethersproject/providers';
import { BigNumber, BigNumberish, Contract } from 'ethers';

const potentialAbis = [
  ['PUBLIC_SALE_PRICE', 'function PUBLIC_SALE_PRICE() public view returns (uint256)'],
  ['PUBLIC_SALE_PRICE', 'function PUBLIC_SALE_PRICE() public constant returns (uint256)'],
  ['MINT_PRICE', 'function MINT_PRICE() public view returns (uint256)'],
  ['MINT_PRICE', 'function MINT_PRICE() public constant returns (uint256)'],
  ['PRICE', 'function PRICE() public view returns (uint256)'],
  ['PRICE', 'function PRICE() public constant returns (uint256)'],
  ['mint_price', 'function mint_price() public view returns (uint256)'],
  ['mint_price', 'function mint_price() public constant returns (uint256)'],
  ['mintPrice', 'function mintPrice() public view returns (uint256)'],
  ['mintPrice', 'function mintPrice() public constant returns (uint256)'],
];

const extractMintPrice = async (
  address: string,
  provider: InfuraProvider,
  knownAbi?: string,
) => {
  let success = false;
  let bestEstimate: BigNumberish = BigNumber.from(0);
  let successfulAbi: string = '';

  // ** If we have a known ABI, let's use it to get the mint price! ** //
  if (typeof knownAbi !== 'undefined') {
    try {
      const mintContract = new Contract(address, [knownAbi], provider);
      bestEstimate = await mintContract.functions[knownAbi]();
      successfulAbi = knownAbi;
      success = true;
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  for (const abi of potentialAbis) {
    try {
      const mintContract = new Contract(address, [abi[1]], provider);
      bestEstimate = await mintContract.functions[abi[0]]();
      [,successfulAbi] = abi;
      success = true;
      break; // break out of the loop if we successfully call
    // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  return {
    success,
    bestEstimate,
    successfulAbi,
  };
};

export default extractMintPrice;
