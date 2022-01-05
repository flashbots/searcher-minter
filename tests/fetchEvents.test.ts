import { configure, getAllERC721LimitOrderEvents } from "../src/utils";

describe("send a flashbot bundle", () => {
  // ** Configure ** //
  const {
    provider,
    YobotERC721LimitOrderContract,
    YobotERC721LimitOrderInterface
  } = configure();

  // ** Filter From Block Number **
  const filterStartBlock = 0;

  it("should fetch events", () => {
    return getAllERC721LimitOrderEvents(
      YobotERC721LimitOrderContract,
      filterStartBlock,
      provider,
      YobotERC721LimitOrderInterface
    ).then(events => {
      expect(events.length).toBeGreaterThan(0)
    });
  });
});