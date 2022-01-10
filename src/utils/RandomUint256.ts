import { randomBytes } from 'crypto';
import BN from 'bn.js';

const generateRandomUint256 = () => {
  // ** Get Random Bytes ** //
  // 32 bytes = 256 bits
  const buffer = randomBytes(32);

  // buffer as native bigint
  const bigInt = BigInt(`0x${buffer.toString('hex')}`);

  // buffer as BN.js number
  const bn = new BN(buffer.toString('hex'), 16);

  return {
    buffer,
    bigInt,
    bn,
  };
};

export default generateRandomUint256;
