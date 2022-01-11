/* eslint-disable no-console */
import { listenNewBlocksBlocknative } from '../src/mempool';

describe('blocknative mempool interaction', () => {
  xtest('connects to blocknative', () => listenNewBlocksBlocknative(
    '0xc47eff74c2e949fee8a249586e083f573a7e56fa',
    5,
    (tx) => console.log('Got Tx:', tx),
  ).then((listener) => {
    console.log('Successfully configured blocknative!', listener);
    expect(1).toBe(1);
  }));
});
