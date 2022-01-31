/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

import {
  approveERC721,
  configure,
  isApproved,
} from '../src/utils';

require('dotenv').config();

console.log('Approving the ERC721 Contract...');

// ** Main Function ** //
async function main() {
  // ** Configure ** //
  const {
    provider,
    wallet,
    YobotERC721LimitOrderContractAddress,
    MINTING_CONTRACT,
    EOA_ADDRESS,
  } = configure();

  // ** Approve the Yobot Contract to transfer our tokens ** //
  // ** Only if it isn't already approved ** //

  const approved = await isApproved(
    MINTING_CONTRACT,
    EOA_ADDRESS,
    YobotERC721LimitOrderContractAddress,
    provider,
  );

  console.log('Is Yobot already approved:', approved);

  if (!approved) {
    console.log('Not approved, proceeding to approve for all...');
    const approvalRes = await approveERC721(
      MINTING_CONTRACT,
      YobotERC721LimitOrderContractAddress,
      wallet,
    );
    console.log('Approval Result:', approvalRes);
  }

  return 0;
}

main();
