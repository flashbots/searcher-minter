/* eslint-disable no-restricted-syntax */

const {
  parentPort: intervalParent,
} = require('worker_threads');

const INTERVAL_TRIGGER = 'TIME_GRANULARITY';
const INTERVAL_GRANULARITY = 10_000;

intervalParent.on('message', async (data: any) => {
  if (data.type === 'start') {
    // ** On interval, send the parent a message to trigger the mempool monitor ** //
    setInterval(() => {
      intervalParent.postMessage(INTERVAL_TRIGGER);
    }, INTERVAL_GRANULARITY);
  }
});
