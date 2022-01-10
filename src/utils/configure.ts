/* eslint-disable max-len */
/* eslint-disable global-require */
import { Wallet, providers, BigNumber } from 'ethers';
import * as ethers from 'ethers';

import { getDeployedContract } from '.';

require('dotenv').config();

const configure = () => {
  // ** Default to Goerli if no chain id provided **
  const CHAIN_ID = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID, 10) : 5;
  console.log('Using CHAIN ID:', CHAIN_ID);

  // ** We need the INFURA_PROJECT_ID **
  if (process.env.INFURA_PROJECT_ID === undefined) {
    console.error('Please provide INFURA_PROJECT_ID env');
    process.exit(1);
  }

  const INFINITE_MINT = '0xc47eff74c2e949fee8a249586e083f573a7e56fa';

  const provider = new providers.InfuraProvider(CHAIN_ID, process.env.INFURA_PROJECT_ID);

  const flashbotsEndpoint = 'https://relay-goerli.flashbots.net';

  // ** We need the WALLET PRIVATE KEY **
  if (process.env.WALLET_PRIVATE_KEY === undefined) {
    console.error('Please provide WALLET_PRIVATE_KEY env');
    process.exit(1);
  }

  console.log('Found a wallet!');

  const defaultGoerliProvider = providers.getDefaultProvider('goerli');
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, defaultGoerliProvider);

  // ** Import the Abis **
  const YobotERC721LimitOrderAbi = require('../abi/YobotERC721LimitOrder.json');
  const YobotInfiniteMintAbi = require('../abi/InfiniteMint.json');
  // const YobotArtBlocksBrokerAbi = require('../abi/YobotArtBlocksBroker.json');

  // ** Instantiate Interfaces **
  const YobotInfiniteMintInterface = new ethers.utils.Interface(YobotInfiniteMintAbi);
  const YobotERC721LimitOrderInterface = new ethers.utils.Interface(YobotERC721LimitOrderAbi);
  const YobotERC721LimitOrderContractAddress = getDeployedContract(CHAIN_ID).YobotERC721LimitOrder;
  console.log('Using YobotERC721LimitOrder defined at:', YobotERC721LimitOrderContractAddress);
  console.log(`https://goerli.etherscan.io/address/${YobotERC721LimitOrderContractAddress}`);

  // ** Sanity Check We Can Fetch the Contract Code **
  (async () => {
    const erc721Code = await provider.getCode(YobotERC721LimitOrderContractAddress);
    if (erc721Code === '0x') {
      console.error('Invalid contract address or provider configuration...');
      process.exit(1);
    } else {
      console.log('Successfully Fetched YobotERC721LimitOrder Contract Code');
    }
  })();

  // const YobotArtBlocksBrokerInterface = new ethers.utils.Interface(YobotArtBlocksBrokerAbi);

  // ** Instantiate Contracts **
  const YobotERC721LimitOrderContract = new ethers.Contract(YobotERC721LimitOrderContractAddress, YobotERC721LimitOrderAbi, provider);
  // const YobotArtBlocksBrokerContract = new ethers.Contract(getDeployedContract(CHAIN_ID).YobotArtBlocksBroker, YobotArtBlocksBrokerAbi, provider);

  // ** Define Lindy Constants ** //
  const ETHER = BigNumber.from(10).pow(18);
  const GWEI = BigNumber.from(10).pow(9);
  const PRIORITY_FEE = GWEI.mul(3);
  const LEGACY_GAS_PRICE = GWEI.mul(12);
  const BLOCKS_TILL_INCLUSION = 2;

  // ** Create a new ethers provider **
  // const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

  return {
    provider,
    wallet,
    CHAIN_ID,
    ETHER,
    GWEI,
    PRIORITY_FEE,
    LEGACY_GAS_PRICE,
    BLOCKS_TILL_INCLUSION,
    flashbotsEndpoint,
    YobotERC721LimitOrderContract,
    YobotERC721LimitOrderContractAddress,
    YobotERC721LimitOrderInterface,
    YobotInfiniteMintInterface,
    INFINITE_MINT,
  };
};

export default configure;
