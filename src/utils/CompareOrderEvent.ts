/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
// TODO: compare order struct and event

const compareOrderEvents = (
  liveOrder: any,
  eventOrder: any,
) => {
  return (
    liveOrder.owner.toString() === eventOrder.user.toString()
    && liveOrder.tokenAddress.toString().toUpperCase() === eventOrder.tokenAddress.toString().toUpperCase()
    && liveOrder.priceInWeiEach.toString() === eventOrder.priceInWeiEach.toString()
    && liveOrder.quantity.toString() === eventOrder.quantity.toString()
    && liveOrder.num.toString() === eventOrder.orderNum.toString()
  );
};

export default compareOrderEvents;
