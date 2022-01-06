type ContractList = {
  YobotArtBlocksBroker: string;
  YobotERC721LimitOrder: string;
};

type DeployedContractsType = {
  1: ContractList;
  3: ContractList;
  4: ContractList;
  5: ContractList;
};

// ** Define our deployed contract addresses **
const DeployedContracts: DeployedContractsType = {
  // mainnet
  1: {
    YobotArtBlocksBroker: '',
    YobotERC721LimitOrder: '',
  },
  // Ropsten
  3: {
    YobotArtBlocksBroker: '',
    YobotERC721LimitOrder: '',
  },
  // rinkeby
  4: {
    YobotArtBlocksBroker: '0x1b78c74b301aa66c3da90556be7290eb2dcc2864',
    YobotERC721LimitOrder: '0x8b5842a935731ed1b92e3211a7f38bebd185eb53',
  },
  // goerli
  5: {
    YobotArtBlocksBroker: '0x041761ca2d7730ae3788f732c1a43db002feff2f',
    YobotERC721LimitOrder: '0x0d29790c2412f42248905f879260f1a6f409a11a',
  },
};

const getDeployedContract = (network: number) => {
  switch (network) {
    case 1:
      return DeployedContracts[1];
    case 3:
      return DeployedContracts[3];
    case 4:
      return DeployedContracts[4];
    case 5:
      return DeployedContracts[5];
    default:
      throw new Error(`Unknown network: ${network}`);
  }
};

export default getDeployedContract;
