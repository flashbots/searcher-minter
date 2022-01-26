/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { InfuraProvider, Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import {
  callOrders,
  configure,
  extractMaxSupplies,
  extractMintPrice,
  extractTotalSupplies,
  // fetchAllERC721LimitOrderEvents,
  fetchSortedOrders,
} from '../src/utils';

require('bignumber.js');

// ** General Config Variables ** //
let provider: InfuraProvider;
let YobotERC721LimitOrderContract: any;
let YobotERC721LimitOrderInterface: any;
let MINTING_CONTRACT: string;

// ** Contract ABIS ** //
let MINTING_ABI: string;
let TOTAL_SUPPLY_ABI: string;
let MAX_SUPPLY_ABI: string;

beforeAll(() => {
  // ** Configure ** //
  const config = configure();
  // @ts-ignore
  provider = config.provider;
  YobotERC721LimitOrderContract = config.YobotERC721LimitOrderContract;
  YobotERC721LimitOrderInterface = config.YobotERC721LimitOrderInterface;
  // ** Extract the potential ABIs ** //
  MINTING_ABI = config.MINTING_ABI;
  TOTAL_SUPPLY_ABI = config.TOTAL_SUPPLY_ABI;
  MAX_SUPPLY_ABI = config.MAX_SUPPLY_ABI;
  MINTING_CONTRACT = config.MINTING_CONTRACT;
});

// *********************** //
// **  TEST MINT PRICE  ** //
// *********************** //
describe('mint price', () => {
  it('extracts the mint price using a known abi', () => extractMintPrice(
    MINTING_CONTRACT,
    provider,
    MINTING_ABI,
  ).then((obj) => {
    const {
      success,
      bestEstimate,
      successfulAbi,
    } = obj;
    console.log('Best mint estimate:', bestEstimate);
    // console.log('Best mint estimate [0]:', bestEstimate[0]);
    // console.log('Best mint estimate [0]:', bestEstimate[0]);
    // console.log('Got best estimate in wei:', parseInt(bestEstimate.toString(), 10));
    // eslint-disable-next-line max-len
    // console.log('Got best estimate in eth:', ethers.utils.formatUnits(bestEstimate.toString(), 'ether'));
    // ** The ABI should be equal ** //
    expect(successfulAbi).toEqual(MINTING_ABI);
    // ** Should be a successful call ** //
    expect(success).toBe(true);
  }));

  it('extracts the mint price without known abi', () => extractMintPrice(
    MINTING_CONTRACT,
    provider,
  ).then((obj) => {
    const {
      success,
      bestEstimate,
      successfulAbi,
    } = obj;
    // console.log('Got best estimate in wei:', parseInt(bestEstimate.toString(), 10));
    // eslint-disable-next-line max-len
    // console.log('Got best estimate in eth:', ethers.utils.formatUnits(bestEstimate.toString(), 'ether'));
    // console.log('Using abi:', successfulAbi);
    // ** Should be a successful call ** //
    expect(success).toBe(true);
  }));
});

// ************************* //
// **  TEST TOTAL SUPPLY  ** //
// ************************* //
describe('total supply', () => {
  it('extracts total supply using a known abi', () => extractTotalSupplies(
    MINTING_CONTRACT,
    provider,
    TOTAL_SUPPLY_ABI,
  ).then((obj) => {
    const {
      totalSupply,
      successfulAbi,
    } = obj;
    // console.log('Got total supply:', totalSupply);
    // ** The ABI should be equal ** //
    expect(successfulAbi).toEqual(TOTAL_SUPPLY_ABI);
    // ** Should be a successful call ** //
    expect(totalSupply).toEqual(0);
  }));

  it('extracts total supply without known abi', () => extractTotalSupplies(
    MINTING_CONTRACT,
    provider,
  ).then((obj) => {
    const {
      totalSupply,
      successfulAbi,
    } = obj;
    // console.log('Got total supply:', totalSupply);
    // console.log('Using abi:', successfulAbi);
    // ** Should be a successful call ** //
    expect(totalSupply).toEqual(0);
  }));
});

// *********************** //
// **  TEST MAX SUPPLY  ** //
// *********************** //
describe('max supply', () => {
  it('extracts max supply using a known abi', () => extractMaxSupplies(
    MINTING_CONTRACT,
    provider,
    MAX_SUPPLY_ABI,
  ).then((obj) => {
    const {
      maxSupply,
      successfulAbi,
    } = obj;
    console.log('Got max supply:', parseInt(maxSupply.toString(), 10));
    // ** The ABI should be equal ** //
    expect(successfulAbi).toEqual(MAX_SUPPLY_ABI);
    // ** Should be a successful call ** //
    expect(parseInt(maxSupply.toString(), 10)).toBeGreaterThan(0);
  }));

  it('extracts max supply without known abi', () => extractMaxSupplies(
    MINTING_CONTRACT,
    provider,
  ).then((obj) => {
    const {
      maxSupply,
      successfulAbi,
    } = obj;
    console.log('Got max supply:', parseInt(maxSupply.toString(), 10));
    console.log('Using abi:', successfulAbi);
    // ** Should be a successful call ** //
    expect(parseInt(maxSupply.toString(), 10)).toBeGreaterThan(0);
  }));
});
