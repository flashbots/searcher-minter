/* eslint-disable no-restricted-syntax */

import { fetchMintingEvents } from '../utils';

const {
  parentPort: walletParent,
} = require('worker_threads');

const WALLET_GRANULARITY = 5_000;

walletParent.on('message', async (data: any) => {
  if (data.type === 'start') {
    const {
      mintingContract,
      provider,
      eoaAddress,
    } = data;
    // ** Create an interval to send the parent the tokens in the wallet ** //
    // ** Executes every WALLET_GRANULARITY / 1_000 seconds ** //
    setInterval(async () => {
      // TODO: get tokens in wallet
      // ** Get the tokens in our wallet  ** //
      const mintingEvents = await fetchMintingEvents(
        mintingContract,
        0, // filterStartBlock
        provider,
        eoaAddress,
      );
      intervalParent.postMessage(mintingEvents);
    }, WALLET_GRANULARITY);
  }
});
