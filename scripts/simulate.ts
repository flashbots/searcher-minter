/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import { BigNumber, ethers } from 'ethers';
import {
  craftTransaction, simulateBundle, craftBundle, createFlashbotsProvider,
} from '../src/flashbots';
import {
  configure, extractMaxSupplies, extractMintPrice, extractTotalSupplies,
} from '../src/utils';

require('dotenv').config();

// ** orders Function ** //
async function orders() {
  console.log('Simulating a Flashbots Bundle...');

  // ** Get Configuration ** //
  const {
    CHAIN_ID: chainId,
    provider,
    wallet,
    flashbotsEndpoint,
    BLOCKS_TILL_INCLUSION: blocksUntilInclusion,
    LEGACY_GAS_PRICE: legacyGasPrice,
    PRIORITY_FEE: priorityFee,
    YobotInfiniteMintInterface: yobotInfiniteMintInterface,
    MINTING_CONTRACT: infiniteMint,
  } = configure();

  // ** Create Flashbots Provider ** //
  const fbp = await createFlashbotsProvider(
    provider,
    flashbotsEndpoint,
    wallet,
  );

  // ** STATE ** //
  let knownMintPriceAbi: string; // the abi to get the mint price
  let knownTotalSupplyAbi: string; // the abi to get the total supply
  let knownMaxSupplyAbi: string; // the abi to get the max supply

  // ** Filter out orders that are not profitable... ** //
  // ** ie: priceInWeiEach < gas price + mint cost ** //
  // const currentGasPrice = await provider.getGasPrice();
  const {
    bestEstimate: mintPrice,
    successfulAbi: successfulMintAbi,
  } = await extractMintPrice(
    infiniteMint,
    provider,
    (knownMintPriceAbi !== undefined && knownMintPriceAbi.length > 0) ? knownMintPriceAbi : undefined,
  );
  console.log('Got mint price:', mintPrice);
  console.log('Got successfuly mint abi:', successfulMintAbi);
  knownMintPriceAbi = successfulMintAbi;
  // const minPrice = mintPrice.add(currentGasPrice);

  // ** Now, we have a list of profitable orders we want to mint for ** //
  // ** Check how many we can mint (MAX_SUPPLY - totalSupply) ** //
  const {
    totalSupply,
    successfulAbi: successfulTotalSupplyAbi,
  } = await extractTotalSupplies(
    infiniteMint,
    provider,
    (knownTotalSupplyAbi !== undefined && knownTotalSupplyAbi.length > 0) ? knownTotalSupplyAbi : undefined,
  );
  console.log('Got total supply:', totalSupply);
  console.log('Got successfuly total supply abi:', successfulTotalSupplyAbi);
  knownTotalSupplyAbi = successfulTotalSupplyAbi;
  const {
    maxSupply,
    successfulAbi: successfulMaxSupplyAbi,
  } = await extractMaxSupplies(
    infiniteMint,
    provider,
    (knownMaxSupplyAbi !== undefined && knownMaxSupplyAbi.length > 0) ? knownMaxSupplyAbi : undefined,
  );
  console.log('Got max supply:', maxSupply);
  console.log('Got successfuly max supply abi:', successfulMaxSupplyAbi);
  knownMaxSupplyAbi = successfulMaxSupplyAbi;
  const remainingSupply = maxSupply.sub(totalSupply);
  console.log('Remaining supply:', remainingSupply);

  // ** Craft the transaction data ** //
  // TODO: refactor this into a function
  const data = yobotInfiniteMintInterface.encodeFunctionData(
    'mint',
    [
      '0xf25e32C0f2928F198912A4F21008aF146Af8A05a', // address to
      ethers.utils.randomBytes(32), // uint256 tokenId
    ],
  );

  // ** Craft a mintable transactions ** //
  const tx = await craftTransaction(
    provider,
    wallet,
    chainId,
    blocksUntilInclusion,
    legacyGasPrice,
    priorityFee,
    BigNumber.from(0), // set gas limit to 0 to use the previous block's gas limit
    infiniteMint,
    data,
    BigNumber.from(mintPrice), // value in wei (mint price)
  );

  // ** Craft a signed bundle of transactions ** //
  const {
    targetBlockNumber,
    transactionBundle,
  }: {
    targetBlockNumber: number,
    transactionBundle: string[]
  } = await craftBundle(
    provider,
    fbp,
    blocksUntilInclusion,
    [tx],
  );

  // ** Simulate Bundle ** //
  console.log('Simulating Bundle: ', transactionBundle);
  console.log('Targeting block:', targetBlockNumber);
  const simulation = await simulateBundle(
    fbp,
    targetBlockNumber,
    transactionBundle,
  );

  console.log('Got Flashbots simulation:', JSON.stringify(simulation, null, 2));
}

orders();
