import { BigNumber } from 'ethers';

type YobotBid = {
  token: string,
  user: string,
  priceInWeiEach: BigNumber,
  quantity: BigNumber,
  orderId: BigNumber,
  orderNum: BigNumber,
};

export default YobotBid;
