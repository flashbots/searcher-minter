/* eslint-disable import/prefer-default-export */
/* eslint-disable spaced-comment */

// **  /////////////////////////////// ** //
// **           FILL ORDER             ** //
// ** //////////////////////////////// ** //

// ** Fills an Order ** //
const fillOrder = async (
  ERC721LimitOrderContract: any,
  orderId: number,
  tokenId: number,
  expectedPriceInWeiEach: number,
  profitTo: string,
  sendNow: boolean,
) => {
  const fillResult = await ERC721LimitOrderContract.fillOrder(
    orderId,
    tokenId,
    expectedPriceInWeiEach,
    profitTo,
    sendNow,
  );
  return fillResult;
};

export {
  fillOrder,
};
