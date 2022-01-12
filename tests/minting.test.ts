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

// ** Contract ABIS ** //
let MINTING_ABI;
let TOTAL_SUPPLY_ABI;
let MAX_SUPPLY_ABI;

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
    const awaitedQueries = eventArray.map(async ({ token, orders }: any) => {
      // let { token, orders } = obj;
      // ** Iterate orders ** //
      const orderQueries = orders.map(async (order: any) => {
        console.log('have order:', order);
        const contractOrder = await callOrders(YobotERC721LimitOrderContract, token, order.user);
        const contractOrderPrice = contractOrder.priceInWeiEach.toString();
        const contractOrderQuantity = contractOrder.quantity.toString();
        const orderPrice = order.priceInWeiEach.toString();
        const orderQuantity = order.quantity.toString();

        if (orderPrice === contractOrderPrice
            && orderQuantity === contractOrderQuantity
        ) {
          const verifiedOrder = {
            token,
            user: order.user,
            priceInWeiEach: contractOrderPrice,
            quantity: contractOrderQuantity,
          };
          return verifiedOrder;
        }
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
