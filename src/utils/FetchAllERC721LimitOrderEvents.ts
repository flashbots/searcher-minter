import { BaseProvider } from '@ethersproject/providers';

const getTimeByBlock = async (
  txHash: string,
  provider: BaseProvider,
) => {
  const blockN = await provider.getTransaction(txHash);
  const blockData = await provider.getBlock(blockN.blockNumber);

  return blockData.timestamp;
};

const fetchAllERC721LimitOrderEvents = async (
  ERC721LimitOrderContract: any,
  filterStartBlock: number,
  provider: BaseProvider,
  ERC721LimitOrderInterface: any,
) => {
  // get all events from the ERC721LimitOrder contract
  const filter = ERC721LimitOrderContract.filters.Action();
  filter.fromBlock = filterStartBlock;
  const logs = await provider.getLogs(filter);
  const events = logs.map((log) => {
    const parsedLog = ERC721LimitOrderInterface.parseLog(log);
    parsedLog.txHash = log.transactionHash;
    return parsedLog;
  });

  // ** Get the timestamp of each event ** //
  for (let i = 0; i < events.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    events[i].timestamp = await getTimeByBlock(events[i].txHash, provider);
  }

  // ** Sort events by decreasing timestamp ** //
  const sortedEvents = events.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

  return sortedEvents;
};

export default fetchAllERC721LimitOrderEvents;
