import { InfuraProvider } from "@ethersproject/providers";
import {
  configure,
  fetchAllERC721LimitOrderEvents,
  fetchSortedOrders
} from "../src/utils";

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

  it("should fetch sorted events", () => {
    return fetchSortedOrders(
      YobotERC721LimitOrderContract,
      filterStartBlock,
      provider,
      YobotERC721LimitOrderInterface
    ).then(events => {
      // ** Now we have a mapping of erc721 token addresses to orders ** //
      // ** Call the YobotERC721LimitOrderContract.orders() function ** //
      // ** inputs: priceInWeiEach uint128, and quantity uint128 ** //
      expect(events.size).toBeGreaterThan(0)
    });
  });
});
