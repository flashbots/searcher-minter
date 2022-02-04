/* eslint-disable max-len */
/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-multi-spaces */
import { AlchemyProvider } from '@ethersproject/providers';
import { Contract, providers } from 'ethers';
import { hexZeroPad, id } from 'ethers/lib/utils';

// ** CONSTANTS ** //
const ZERO_ADDRESS_PADDED = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ERC721_TRANSFER_EVENT_ABI = ['event Transfer(address indexed from, address indexed to, uint256 indexed id)'];

const fetchMintingEvents = async (
  MintingContractAddress: string,
  filterStartBlock: number,
  provider: providers.InfuraProvider | AlchemyProvider,
  filterAddress: string,
) => {
  // ** Pad the filter address ** //
  const paddedFilterAddress = hexZeroPad(filterAddress, 32);

  // ** Create the contract from the transfer event abi ** //
  // const MintingContract = new Contract(MintingContractAddress, ERC721_TRANSFER_EVENT_ABI, provider);

  // ** Get All ERC721 tokens transferred to the filterAddress ** //
  const toFilter = {
    address: MintingContractAddress,
    fromBlock: 0,
    topics: [
      id('Transfer(address,address,uint256)'),
      null,
      paddedFilterAddress,
    ],
  };
  const toLogs = await provider.getLogs(toFilter);

  // ** Get all ERC721 tokens transferred from the filterAddress ** //
  const fromFilter = {
    address: MintingContractAddress,
    fromBlock: 0,
    topics: [
      id('Transfer(address,address,uint256)'),
      paddedFilterAddress,
    ],
  };
  const fromLogs = await provider.getLogs(fromFilter);

  // ** Combine the logs and sort by block number ** //
  const allLogs = [...toLogs, ...fromLogs];
  const sortedLogs = allLogs.sort((a, b) => (a.blockNumber > b.blockNumber ? 1 : -1));

  // ** Filter for current wallet tokens ** //
  let resultLogs: any = {};
  for (const log of sortedLogs) {
    // ** If it was transfered to the filter address, add to resultLogs ** //
    if (log.topics[2].toUpperCase() === paddedFilterAddress.toUpperCase()) {
      resultLogs[log.topics[3].toUpperCase()] = log;
    } else if (log.topics[1].toUpperCase() === paddedFilterAddress.toUpperCase()) {
      // ** If it was transferred out, remove ** /
      delete resultLogs[log.topics[3].toUpperCase()];
    }
  }

  // ** Parse Logs into Transfer Events ** //
  const ownedTokens = Object.entries(resultLogs).map(([_address, log]: any) => ({
    from: log.topics[1],
    to: log.topics[2],
    id: log.topics[3],
  }));

  return ownedTokens;
};

export default fetchMintingEvents;
