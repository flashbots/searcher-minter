/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-multi-spaces */
import { Contract, providers, Signer } from 'ethers';
import { hexZeroPad, id } from 'ethers/lib/utils';

// ** CONSTANTS ** //
const SET_APPROVAL_FOR_ALL = ['function setApprovalForAll(address operator, bool approved) public virtual'];

const approveERC721 = async (
  MintingContractAddress: string,
  operator: string,
  wallet: Signer,
) => {
  // ** Create the contract using out abi ** //
  const MintingContract = new Contract(MintingContractAddress, SET_APPROVAL_FOR_ALL, wallet);

  const approvalResult = await MintingContract.setApprovalForAll(
    operator,   // operator
    true,       // approved
  );

  return approvalResult;
};

export default approveERC721;
