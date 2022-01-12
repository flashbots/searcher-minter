/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { InfuraProvider } from '@ethersproject/providers';
import { Contract } from 'ethers';

const potentialAbis = [
  'function PUBLIC_SALE_PRICE() public view returns (uint256)',
  'function PUBLIC_SALE_PRICE() public constant returns (uint256)',
  'function MINT_PRICE() public view returns (uint256)',
  'function MINT_PRICE() public constant returns (uint256)',
  'function PRICE() public view returns (uint256)',
  'function PRICE() public constant returns (uint256)',
  'function mint_price() public view returns (uint256)',
  'function mint_price() public constant returns (uint256)',
  'function mintPrice() public view returns (uint256)',
  'function mintPrice() public constant returns (uint256)',
];

const extractMintPrice = async (
  address: string,
  provider: InfuraProvider,
  knownAbi?: string,
) => {
  let success = false;
  let bestEstimate = 0;
  let successfulAbi: string = '';

  // ** If we have a known ABI, let's use it to get the mint price! ** //
  if (typeof knownAbi !== 'undefined') {
    try {
      const mintContract = new Contract(address, [knownAbi], provider);
      bestEstimate = await mintContract.publicSalePrice();
      successfulAbi = knownAbi;
      success = true;
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  for (const abi of potentialAbis) {
    try {
      const mintContract = new Contract(address, [abi], provider);
      bestEstimate = await mintContract.publicSalePrice();
      successfulAbi = abi;
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
