import { AlchemyProvider, InfuraProvider } from '@ethersproject/providers';
import { Contract } from 'ethers';

// ** CONSTANTS ** //
const IS_APPROVED_FOR_ALL = ['function isApprovedForAll(address owner, address operator) public view returns (bool)'];

const isApproved = async (
  MintingContractAddress: string,
  owner: string,
  operator: string,
  wallet: InfuraProvider | AlchemyProvider,
) => {
  // ** Create the contract using out abi ** //
  const MintingContract = new Contract(MintingContractAddress, IS_APPROVED_FOR_ALL, wallet);

  const approvalResult = await MintingContract.isApprovedForAll(
    owner,
    operator,
  );

  return approvalResult;
};

export default isApproved;
