import { BigNumber } from 'ethers';

type YobotBid = {
  token: string,
  user: string,
  priceInWeiEach: BigNumber,
  quantity: BigNumber,
};

export default YobotBid;
