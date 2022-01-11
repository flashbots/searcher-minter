// @ts-nocheck
const path = require('path');

// ?? Hack to deal with typescript for worker_threads ?? //

console.log("in orders module");

require('ts-node').register();
require(path.resolve(__dirname, './Orders.ts'));
