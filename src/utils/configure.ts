/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable global-require */
import { Wallet, providers, BigNumber } from 'ethers';
import * as ethers from 'ethers';

import { getDeployedContract } from '.';

require('dotenv').config();

const configure = () => {
  // ** Environment Variable Check ** //
  if (
    process.env.INFURA_PROJECT_ID === undefined
    || process.env.ERC721_CONTRACT_ADDRESS === undefined
    || process.env.WALLET_PRIVATE_KEY === undefined
  ) {
    console.error('Bad environment variable configuration');
    console.error('Use the ".env.example" file to configure your environment variables and enter them in a ".env" file');
    process.exit(1);
  }

  // ** Wallet Public Key ** //
  const { EOA_ADDRESS } = process.env;

  // ** Optionally Specify the Minting ABI ** //
  const { MINTING_ABI } = process.env;

  // **  Optionally Specify the Total Supply ABI ** //
  const { TOTAL_SUPPLY_ABI } = process.env;

  // **  Optionally Specify the Max Supply ABI ** //
  const { MAX_SUPPLY_ABI } = process.env;

  // ** Discord Webhooks ** //
  const { DISCORD_WEBHOOK_URL, PUBLIC_DISCORD_WEBHOOK_URL } = process.env;

  // ** Contract we want to mint from ** //
  const MINTING_CONTRACT = process.env.ERC721_CONTRACT_ADDRESS ? process.env.ERC721_CONTRACT_ADDRESS : '';

  // ** Default to Goerli if no chain id provided **
  const CHAIN_ID = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID, 10) : 5;
  // console.log('Using CHAIN ID:', CHAIN_ID);

  // ** Set up an Infura Provider ** //
  const provider = new providers.InfuraProvider(CHAIN_ID, process.env.INFURA_PROJECT_ID);

  // ** Configure Flashbots Relay Endpoint ** //
  const flashbotsEndpoint = CHAIN_ID === 1 ? 'https://relay.flashbots.net' : 'https://relay-goerli.flashbots.net';

  // ** Setup the wallet ** //
  const defaultProvider = providers.getDefaultProvider(CHAIN_ID); // 'goerli');
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, defaultProvider);

  // ** Import the Yobot Abis ** //
  const YobotERC721LimitOrderAbi = require('../abi/YobotERC721LimitOrder.json');
  const YobotInfiniteMintAbi = require('../abi/InfiniteMint.json');
  // const YobotArtBlocksBrokerAbi = require('../abi/YobotArtBlocksBroker.json');

  // ** Instantiate Interfaces ** //
  const YobotInfiniteMintInterface = new ethers.utils.Interface(YobotInfiniteMintAbi);
  const YobotERC721LimitOrderInterface = new ethers.utils.Interface(YobotERC721LimitOrderAbi);
  // const YobotArtBlocksBrokerInterface = new ethers.utils.Interface(YobotArtBlocksBrokerAbi);
  const YobotERC721LimitOrderContractAddress = getDeployedContract(CHAIN_ID).YobotERC721LimitOrder;
  // console.log('Using YobotERC721LimitOrder defined at:', YobotERC721LimitOrderContractAddress);
  // console.log(`https://goerli.etherscan.io/address/${YobotERC721LimitOrderContractAddress}`);

  // ** Sanity Check We Can Fetch the Contract Code ** //
  (async () => {
    const erc721Code = await provider.getCode(YobotERC721LimitOrderContractAddress);
    if (erc721Code === '0x') {
      console.error('Invalid contract address or provider configuration...');
      process.exit(1);
    } else {
      // console.log('Successfully Fetched YobotERC721LimitOrder Contract Code');
    }
  })();

  // ** Instantiate Contracts ** //
  const YobotERC721LimitOrderContract = new ethers.Contract(YobotERC721LimitOrderContractAddress, YobotERC721LimitOrderAbi, wallet);
  // const YobotArtBlocksBrokerContract = new ethers.Contract(getDeployedContract(CHAIN_ID).YobotArtBlocksBroker, YobotArtBlocksBrokerAbi, provider);

  // ** Define Lindy Constants ** //
  const ETHER = BigNumber.from(10).pow(18);
  const GWEI = BigNumber.from(10).pow(9);
  const PRIORITY_FEE = GWEI.mul(3);
  const LEGACY_GAS_PRICE = GWEI.mul(12);
  const BLOCKS_TILL_INCLUSION = 2;

  return {
    provider,
    wallet,
    EOA_ADDRESS,
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
    MINTING_CONTRACT,
    DISCORD_WEBHOOK_URL,
    PUBLIC_DISCORD_WEBHOOK_URL,
    MINTING_ABI,
    TOTAL_SUPPLY_ABI,
    MAX_SUPPLY_ABI,
  };
};

export default configure;
