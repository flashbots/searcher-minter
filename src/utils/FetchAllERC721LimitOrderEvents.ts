import { providers } from "ethers"
import { Web3Provider } from "@ethersproject/providers"


const getAllERC721LimitOrderEvents = async function(
  ERC721LimitOrderContract,
  filterStartBlock: number,
  provider: providers.InfuraProvider,
  ERC721LimitOrderInterface: any
) {
	// get all events from the ERC721LimitOrder contract
  console.log("Fetching all erc721 events...");
	const filter = ERC721LimitOrderContract.filters.Action()
	filter.fromBlock = filterStartBlock
	const logs = await provider.getLogs(filter)
  console.log("Got logs:", logs)
	const events = logs.map(log => {
		let parsedLog = ERC721LimitOrderInterface.parseLog(log)
		parsedLog.txHash = log.transactionHash
		return parsedLog
	})
	return events
}

export default getAllERC721LimitOrderEvents;