/* eslint-disable no-underscore-dangle */
const filterEventsByTokenAddress = (
  tokenAddress: string,
  allEvents: any[],
) => allEvents.filter((event) => event.args._tokenAddress === tokenAddress);

export default filterEventsByTokenAddress;
