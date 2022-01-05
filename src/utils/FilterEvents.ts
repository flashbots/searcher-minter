const filterEventsByTokenAddress = (
  tokenAddress: string,
  allEvents: any[]
) => {
	return allEvents.filter(event => event.args._tokenAddress == tokenAddress)
}

export default filterEventsByTokenAddress;
