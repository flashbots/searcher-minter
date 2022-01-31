/* eslint-disable no-restricted-syntax */
/* eslint-disable arrow-body-style */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { InfuraProvider, Web3Provider } from '@ethersproject/providers';
import {
  callOrders,
  configure,
  // fetchAllERC721LimitOrderEvents,
  fetchSortedOrders,
} from '../src/utils';

require('bignumber.js');

let provider: InfuraProvider;
let YobotERC721LimitOrderContract: any;
let YobotERC721LimitOrderInterface: any;

beforeAll(() => {
  // ** Configure ** //
  const config = configure();
  // @ts-ignore
  provider = config.provider;
  YobotERC721LimitOrderContract = config.YobotERC721LimitOrderContract;
  YobotERC721LimitOrderInterface = config.YobotERC721LimitOrderInterface;
});

describe('fetches orders', () => {
  // ** Filter From Block Number **
  const filterStartBlock = 0;

  it('fetches verified orders', () => fetchSortedOrders(
    YobotERC721LimitOrderContract,
    filterStartBlock,
    provider,
    YobotERC721LimitOrderInterface,
  ).then((events) => {
    // ** Iterate mapping ** //
    const eventArray: any = [];
    events.forEach((orders, token) => eventArray.push({ token, orders }));
    const awaitedQueries = eventArray.map(({ token, orders }: any) => {
      // let { token, orders } = obj;
      // ** Iterate orders ** //
      const orderQueries = orders.map((order: any) => {
        // ** Fetch all user's orders and verify they exist ** //
        return callOrders(YobotERC721LimitOrderContract, order.user).then((fetchedOrders) => {
          // ** Loop over all the user's open orders to make sure it exists ** //
          for (const fetchedOrder of fetchedOrders) {
            const contractOrderPrice = fetchedOrder.priceInWeiEach.toString();
            const contractOrderQuantity = fetchedOrder.quantity.toString();
            const contractOrderNum = fetchedOrder.num.toString();
            const orderPrice = order.priceInWeiEach.toString();
            const orderQuantity = order.quantity.toString();
            const orderNum = order.orderNum.toString();

            if (orderPrice === contractOrderPrice
                && orderQuantity === contractOrderQuantity
                && orderNum === contractOrderNum
            ) {
              const verifiedOrder = {
                token,
                user: order.user,
                priceInWeiEach: contractOrderPrice,
                quantity: contractOrderQuantity,
              };
              return verifiedOrder;
            }
          }
        });
      });

      return Promise.all(orderQueries).then((query) => query);
    });

    return Promise.all(awaitedQueries).then((verified_orders: any) => {
      // ** Flatten and filter out undefined ** //
      const flattenedOrders = [].concat(...verified_orders).filter(Boolean);
      console.log('Verified Orders:', flattenedOrders);
      expect(flattenedOrders.length).toBeGreaterThan(0);
    });
  }));
});
