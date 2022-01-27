/* eslint-disable no-restricted-syntax */

const {
  parentPort: intervalParent,
} = require('worker_threads');

const INTERVAL_TRIGGER = 'TIME_GRANULARITY';
const INTERVAL_GRANULARITY = 10_000;

intervalParent.on('message', async (data: any) => {
  if (data.type === 'start') {
    // ** On interval, send the parent a message to trigger the mempool monitor ** //
    console.log('Creating interval...');
    setInterval(() => {
      console.log('Interval triggered in the Interval Worker');
      intervalParent.postMessage(INTERVAL_TRIGGER);
    }, INTERVAL_GRANULARITY);
  }
});
