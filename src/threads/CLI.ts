const { parentPort } = require('worker_threads');

parentPort.on('message', async (data: any) => {
  if (data.type === 'start') {
    // TODO:
  }
});
