/* eslint-disable no-restricted-syntax */

import { configure, fetchMintingEvents } from '../utils';

const {
  parentPort: walletParent,
} = require('worker_threads');

const WALLET_GRANULARITY = 10_000;

const {
  provider,
  MINTING_CONTRACT: mintingContract,
  EOA_ADDRESS: eoaAddress,
} = configure();

walletParent.on('message', async (data: any) => {
  if (data.type === 'start') {
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
      walletParent.postMessage(mintingEvents);
    }, WALLET_GRANULARITY);
  }
});
