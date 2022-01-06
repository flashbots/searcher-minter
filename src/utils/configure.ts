import { Wallet, providers } from "ethers";
import * as ethers from 'ethers';

import { getDeployedContract } from './';

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

  const provider = new providers.InfuraProvider(CHAIN_ID, process.env.INFURA_PROJECT_ID);

  const flashbots_endpoint = 'https://relay-goerli.flashbots.net';

  // ** We need the WALLET PRIVATE KEY **
  if (process.env.WALLET_PRIVATE_KEY === undefined) {
    console.error('Please provide WALLET_PRIVATE_KEY env');
    process.exit(1);
  }

  console.log('Found a wallet!');

  const defaultGoerliProvider = providers.getDefaultProvider('goerli')
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, defaultGoerliProvider);

  // ** Import the Abis **
  const YobotERC721LimitOrderAbi = require('../abi/YobotERC721LimitOrder.json');
  const YobotArtBlocksBrokerAbi = require('../abi/YobotArtBlocksBroker.json');

  // ** Instantiate Interfaces **
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

  // eslint-disable-next-line no-unused-vars
  const YobotArtBlocksBrokerInterface = new ethers.utils.Interface(YobotArtBlocksBrokerAbi);

  // ** Instantiate Contracts **
  const YobotERC721LimitOrderContract = new ethers.Contract(YobotERC721LimitOrderContractAddress, YobotERC721LimitOrderAbi, provider);
  // eslint-disable-next-line no-unused-vars
  const YobotArtBlocksBrokerContract = new ethers.Contract(getDeployedContract(CHAIN_ID).YobotArtBlocksBroker, YobotArtBlocksBrokerAbi, provider);

  // ** ethers.js can use Bignumber.js class OR the JavaScript-native bigint **
  // ** I changed this to bigint as it is MUCH easier to deal with **
  // eslint-disable-next-line no-unused-vars
  const GWEI: bigint = 10n ** 9n;
  // eslint-disable-next-line no-unused-vars
  const ETHER: bigint = 10n ** 18n;

  // ** Create a new ethers provider **
  // const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

  return {
    provider,
    wallet,
    CHAIN_ID,
    flashbots_endpoint,
    YobotERC721LimitOrderContract,
    YobotERC721LimitOrderInterface
  }
}

export default configure;
