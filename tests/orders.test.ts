import { InfuraProvider } from "@ethersproject/providers";
import {
  callOrders,
  configure,
  fetchAllERC721LimitOrderEvents,
  fetchSortedOrders
} from "../src/utils";

require("bignumber.js");

let provider: InfuraProvider;
let YobotERC721LimitOrderContract: any;
let YobotERC721LimitOrderInterface: any;

// ** Filter From Block Number **
const filterStartBlock = 0;

beforeAll(() => {
  // ** Configure ** //
  let config = configure();
  provider = config.provider;
  YobotERC721LimitOrderContract = config.YobotERC721LimitOrderContract;
  YobotERC721LimitOrderInterface = config.YobotERC721LimitOrderInterface;
});

describe("fetches orders", () => {
  // ** Configure ** //
  const {
    provider,
    YobotERC721LimitOrderContract,
    YobotERC721LimitOrderInterface
  } = configure();

  // ** Filter From Block Number **
  const filterStartBlock = 0;

  it("fetches verified orders", () => {
    return fetchSortedOrders(
      YobotERC721LimitOrderContract,
      filterStartBlock,
      provider,
      YobotERC721LimitOrderInterface
    ).then(events => {
      expect(events.size).toBeGreaterThan(0)

      // ** Now we have a mapping of erc721 token addresses to orders ** //
      // ** Call the YobotERC721LimitOrderContract.orders() function ** //
      // ** inputs: priceInWeiEach uint128, and quantity uint128 ** //

      // ** Iterate mapping ** //
      let event_array: any = []
      events.forEach((orders, token) => event_array.push({ token, orders }))
      let awaited_queries = event_array.map(async ({ token, orders }: any) => {
        // let { token, orders } = obj;
        // ** Iterate orders ** //
        let order_queries = orders.map(async (order: any) => {
          console.log("have order:", order);
          let contract_order = await callOrders(YobotERC721LimitOrderContract, token, order.user);
          let contract_order_price = contract_order.priceInWeiEach.toString();
          let contract_order_quantity = contract_order.quantity.toString();
          let order_price = order.priceInWeiEach.toString();
          let order_quantity = order.quantity.toString();

          if(order_price == contract_order_price
            && order_quantity == contract_order_quantity
          ) {
            let verified_order = {
              token: token,
              user: order.user,
              priceInWeiEach: contract_order_price,
              quantity: contract_order_quantity,
            };
            return verified_order;
          }
        });

        return Promise.all(order_queries).then((query) => {
          return query;
        })
      });

      return Promise.all(awaited_queries).then((verified_orders: any) => {
        // ** Flatten and filter out undefined ** //
        const flattened_orders = [].concat(...verified_orders).filter(Boolean);
        console.log("Verified Orders:", flattened_orders);
        expect(flattened_orders.length).toBeGreaterThan(0)
      })
    });
  });
});
