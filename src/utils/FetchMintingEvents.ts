/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-multi-spaces */
import { Contract, providers } from 'ethers';
import { hexZeroPad, id } from 'ethers/lib/utils';

// const getTimeByBlock = async (txHash: string, provider: providers.InfuraProvider) => {
//   const blockN = await provider.getTransaction(txHash);
//   const blockData = await provider.getBlock(blockN.blockNumber);

//   return blockData.timestamp;
// };

const ERC721_TRANSFER_EVENT_ABI = ['event Transfer(address indexed from, address indexed to, uint256 indexed id)'];

const fetchMintingEvents = async (
  MintingContractAddress: string,
  filterStartBlock: number,
  provider: providers.InfuraProvider,
  filterAddress: string,
) => {
  // ** Create the contract from the transfer event abi ** //
  const MintingContract = new Contract(MintingContractAddress, ERC721_TRANSFER_EVENT_ABI, provider);

  // ** Get All ERC721 tokens transferred to the filterAddress ** //
  const toFilter = {
    address: MintingContractAddress,
    fromBlock: 0,
    topics: [
      id('Transfer(address,address,uint256)'),
      null,
      hexZeroPad(filterAddress, 32),
    ],
  };
  const logs = await provider.getLogs(toFilter);
  const tokenTransfers = logs.map((log) => ({
    from: log.topics[1],
    to: log.topics[2],
    id: log.topics[3],
  }));

  return tokenTransfers;

  // ** Get all ERC721 tokens transferred from the filterAddress ** //

  // filter.fromBlock = filterStartBlock;

  // // ** Get the timestamp of each event ** //
  // for (let i = 0; i < events.length; i += 1) {
  //   // eslint-disable-next-line no-await-in-loop
  //   events[i].timestamp = await getTimeByBlock(events[i].txHash, provider);
  // }

  // // ** Sort events by decreasing timestamp ** //
  // const sortedEvents = events.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

  // return sortedEvents;
};

export default fetchMintingEvents;
