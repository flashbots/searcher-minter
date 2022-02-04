/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */

import { fillOrder, postDiscord } from "src/utils";

const {
  parentPort: fillOrdersParent,
} = require('worker_threads');

let fillingLocked = false;

type FillingOrder = {
  orderId: string;
  tokenId: string;
};

let fillingOrders: FillingOrder[] = []; // orders that we placed to fill

fillOrdersParent.on('message', async (data: any) => {
  if (data.type === 'fill') {
    // ** Fill Orders if not already filling ** //
    if (!fillingLocked) {
      fillingLocked = true;

      // ** Destructure Arguments ** //
      const {
        walletTokens,
        remainingOrders,
        discordWebhookUrl,
        YobotERC721LimitOrderContract,
        eoaAddress,
      } = data;

      // ** Map wallet tokens to token ids ** //
      const tokens = walletTokens.map((e: any) => e.id);
      console.log('[FillOrdersThread] Wallet has tokens:', tokens);

      // ** Try to fill orders with the given token ids ** //
      let tokenIdNum = 0;
      for (const order of remainingOrders) {
        if (tokenIdNum >= tokens.length) {
          nonFilledOrders.push(order);
        } else {
          console.log('Attempting to fill order:', order);
          await postDiscord(
            discordWebhookUrl,
            `⌛ FILLING ORDER ${order.orderId} ⌛`,
          );
          try {
            const fillRes = await fillOrder(
              YobotERC721LimitOrderContract,
              order.orderId,
              tokens[tokenIdNum],
              order.priceInWeiEach,
              eoaAddress,
              true, // we want the profit immediately to continue minting
            );
            // TODO: if the fillOrder response is bad, we add order back to nonFilledOrders
            console.log('Got fill result:', fillRes);
            try {
              await postDiscord(
                discordWebhookUrl,
                `✅ ORDER ${order.orderId} FILLED ✅`,
              );
            } catch (ex) { /* IGNORE */ }
          } catch (e) {
            console.log('Failed to fill order!', e);
            await postDiscord(
              discordWebhookUrl,
              `❌ FAILED TO FILL ORDER ${order.orderId} ❌`,
            );
            nonFilledOrders.push(order);
          }
        }
        tokenIdNum += 1;
      }

      // ** Save minted orders to a json file incase our searcher crashes ** //
      // saveJson(nonFilledOrders, MINTED_ORDERS_FILE);
    }
    // !! Otherwise ignore, and fill later !! //
  }
});
