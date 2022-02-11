/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import { BigNumber } from 'ethers';
import {
  callBalance,
  callOrders,
  compareOrderEvents,
  configure,
  fetchSortedOrders,
} from '../src/utils';

require('dotenv').config();

const sortOrders = (verifiedOrders: any[]) => {
  // ** Try to parse verified orders as big numbers ** //
  verifiedOrders.sort((a, b) => {
    // ** Parse strings as big numbers ** //
    const bp = BigNumber.from(b.priceInWeiEach);
    const ap = BigNumber.from(a.priceInWeiEach);
    return bp.sub(ap).gt(1) ? 1 : -1;
  });

  return verifiedOrders;
};

// ** Configure ** //
const {
  provider,
  EOA_ADDRESS,
  MINTING_CONTRACT,
  YobotERC721LimitOrderContract: yobotERC721LimitOrderContract,
  YobotERC721LimitOrderInterface: yobotERC721LimitOrderInterface,
} = configure();

const fetchBalanceAndTokens = async () => {
  // ** Fetch the Balance of the searcher ** //
  const balance = await callBalance(
    MINTING_CONTRACT,
    EOA_ADDRESS,
    provider,
  );
  return balance;
};

const fetchOrdersAndBalance = async () => {
  // ** Fetch Sorted Orders ** //
  const events = await fetchSortedOrders(
    yobotERC721LimitOrderContract,
    0, // filterStartBlock
    provider,
    yobotERC721LimitOrderInterface,
  );

  // ** Iterate mapping ** //
  const eventArray: any = [];
  events.forEach((orderList, token) => eventArray.push({ token, orderList }));

  const verifiedOrders = [];

  for (const { token, orderList } of eventArray) {
    // let { token, orders } = obj;
    // ** Iterate orders ** //
    for (const order of orderList) {
      // eslint-disable-next-line no-await-in-loop
      const fetchedOrders = await callOrders(
        yobotERC721LimitOrderContract,
        order.user,
      );
      for (const fetchedOrder of fetchedOrders) {
        const contractOrderPrice = fetchedOrder.priceInWeiEach.toString();
        const contractOrderQuantity = fetchedOrder.quantity.toString();

        if (compareOrderEvents(fetchedOrder, order)) {
          const verifiedOrder = {
            token,
            user: order.user,
            priceInWeiEach: contractOrderPrice,
            quantity: contractOrderQuantity,
            orderId: order.orderId,
            orderNum: order.orderNum,
          };
          verifiedOrders.push(verifiedOrder);
        }
      }
    }
  }

  // ** Sort the orders in a separate function ** //
  sortOrders(verifiedOrders);

  verifiedOrders.sort((a, b) => {
    // ** Parse strings as big numbers ** //
    const bp = BigNumber.from(b.priceInWeiEach);
    const ap = BigNumber.from(a.priceInWeiEach);
    return bp.sub(ap).gt(1) ? 1 : -1;
  });

  // ** Get the total number of erc721 tokens left to mint using order quantities ** //
  const numberLeftToMint = verifiedOrders.map((o) => parseInt(o.quantity, 10));
  const numberERC721Tokens = numberLeftToMint.reduce((a, b) => a + b, 0);
  console.log('Number of ERC721 Tokens in outstanding orders:', numberERC721Tokens);

  // ** Get searcher balance and use as inventory - ignore currently minting ** //
  const balance = await fetchBalanceAndTokens();
  console.log('Searcher Balance:', balance.toNumber());
  console.log('Number of ERC721 Tokens left to be minted:', numberERC721Tokens - balance.toNumber());
};

const INTERVAL = 30_000;

// ** orders Function ** //
async function orders() {
  console.log(`Setting up order fetching on a ${INTERVAL / 1000} second interval...`);

  // ** Fatch orders on a 20 second interval ** //
  setInterval(async () => {
    console.log('[TRIGGER] Order Fetching Interval Triggered');
    await fetchOrdersAndBalance();
  }, INTERVAL);
  await fetchOrdersAndBalance();
}

orders();
