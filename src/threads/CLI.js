/* eslint-disable import/no-dynamic-require */
// @ts-nocheck
const path = require('path');

// ?? Hack to deal with typescript for worker_threads ?? //

require('ts-node').register();
require(path.resolve(__dirname, './CLI.ts'));
