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

describe("fetches all events", () => {
  it("should fetch events", () => {
    return fetchAllERC721LimitOrderEvents(
      YobotERC721LimitOrderContract,
      filterStartBlock,
      provider,
      YobotERC721LimitOrderInterface
    ).then(events => {
      expect(events.length).toBeGreaterThan(0)
    });
  });
});

describe("sorts events", () => {
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
      expect(events.size).toBeGreaterThan(0)
    });
  });
});
