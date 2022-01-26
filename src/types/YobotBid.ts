import { BigNumber } from 'ethers';

type YobotBid = {
  token: string,
  user: string,
  priceInWeiEach: number,
  quantity: number,
  orderId: BigNumber,
  orderNum: BigNumber,
};

export default YobotBid;
