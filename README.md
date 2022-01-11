# yobot-searcher • [![tests](https://github.com/nascentxyz/yobot-searcher/actions/workflows/test.yml/badge.svg)](https://github.com/nascentxyz/yobot-searcher/actions/workflows/test.yml) [![lints](https://github.com/nascentxyz/yobot-searcher/actions/workflows/lint.yml/badge.svg)](https://github.com/nascentxyz/yobot-searcher/actions/workflows/lint.yml) ![GitHub](https://img.shields.io/github/license/nascentxyz/yobot-searcher) ![GitHub package.json version](https://img.shields.io/github/package-json/v/nascentxyz/yobot-searcher)

**Robust** Searcher executing [Yobot](https://yobot.com) bids with [Flashbot](https://flashbots.net) bundles.

### Architecture
```ml
scripts
├─ mint — "Script to Mint Two InfiniteMint ERC721 Tokens using Flashbots Bundles"
├─ orders — "Script to Fetch Yobot Contract Open Orders"
├─ run — "Main Script that runs the Yobot Searcher"
src
├─ abi/* — "Contract ABIs"
├─ flashbots
│  ├─ CraftBundle — "Creates a Flashbots Bundle"
│  ├─ CraftTransaction — "Creates a Flashbots Transaction"
│  ├─ FlashbotsProvider — "Instantiates a Flashbots Provider"
│  ├─ SendBundle — "Sends a Flashbots Bundle"
│  ├─ SimulateBundle — "Simulates a Flashbots Bundle"
│  ├─ ValidateSimulation — "Validates a Flashbots Simulation"
│  └─ ValidateSubmitResponse — "Validates that the Submitted Flashbots Bundle didn't error"
├─ mempool
│  └─ BlocknativeSocket — "Creates a Websocket Connection to Blocknative Mempool API Service"
├─ threads
│  ├─ Mempool.js — "Woker Scripts can't have a ts extension, this is a workaround"
│  ├─ Mempool.ts — "Mempool thread that runs the Blocknative Mempool Websocket Connection"
│  ├─ Orders.js — "Woker Scripts can't have a ts extension, this is a workaround"
│  └─ Orders.ts — "Orders Thread that sends a list of orders to the parent process on every new block"
├─ utils
│  ├─ CallOrders — "Helper to Fetch Yobot Contract Open Orders"
│  ├─ DeployedContracts — "Config File for Deployed Contracts"
│  ├─ FetchAllERC721LimitOrderEvents — "Get Yobot ERC721 Limit Order Contract Events"
│  ├─ FetchLatestOrders — "Get the Latest Orders Helper Function"
│  ├─ FetchSortedOrders — "Sort Yobot Orders"
│  ├─ FilterEvents — "Filters Yobot Orders"
│  ├─ RandomUint256 — "Generates a Random Uint256"
│  └─ SaveJson — "Helper to Save JSON to a File"
tests
├─ events.test.ts — "Test Reading Events from Yobot Contracts"
├─ flashbots.test.ts — "Test Simulating and Sending Flashbots Bundles"
├─ mempool.test.ts — "Test Listening and Responding to Transactions in the Mempool"
└─ orders.test.ts — "Test Fetching Outstanding Orders/Bids on Yobot Contracts"
```

### Requirements

Install Nix and Dapptools:
```bash
# user must be in sudoers
curl -L https://nixos.org/nix/install | sh

# Run this or login again to use Nix
. "$HOME/.nix-profile/etc/profile.d/nix.sh"

# Install Dapptools
curl https://dapp.tools/install | sh
```

Configure Environment Variables by creating a `.env` file in the root directory of the project:
```bash
cp .env.example .env
```

> Note:  It is EXTREMELY dangerous to deal with private keys in this manner, but bots require access to these keys to function. Be careful when using raw private keys that own mainnet ETH or other valuable assets. Keep as little value in these "hot" accounts as possible.


Then, enter all the values in the `.env` file.

Get some [Goerli](https://goerli.etherscan.io/) ETH on a wallet (you'll need a [faucet](https://faucet.goerli.mudit.blog/)). Extract that Goerli wallet's private key (in MetaMask `Account Details -> Export Private Key`).
Alternatively, claim testnet funds on Paradigm's [faucet](https://faucet.paradigm.xyz).

### Usage

To view Open Orders on the Yobot ERC721 Limit Order Contract, run:
```bash
yarn scripts:orders
```

To mint two erc721 tokens on the mock InfiniteMint Contract (only deployed on Goerli), run:
```bash
yarn scripts:mint
```

To run the Yobot Searcher:
```bash
yarn scripts:run
```

### Interactions

To interact with a contract via cli using Dapptools' [seth](https://github.com/dapphub/dapptools/tree/master/src/seth), first import an account using ethsign:
```bash
ethsign import
```

Then, enter your wallet's private key when prompted.

Send a transaction via Dapptools' [seth](https://github.com/dapphub/dapptools/tree/master/src/seth) to view the results in the mempool listener:
```bash
ETH_FROM=0xf25e32C0f2928F198912A4F21008aF146Af8A05a ETH_RPC_URL=<your_rpc_api_url> seth send 0xc47eff74c2e949fee8a249586e083f573a7e56fa 'mint(address,uint256)' 0xf25e32C0f2928F198912A4F21008aF146Af8A05a 0xf25e32C0f2928F198912A4F21108aF146Af8A05a
```


### Acknowledgements and Resources

- [docs.flashbots.net](https://docs.flashbots.net)
- [Forked searcher-minter repo](https://github.com/flashbots/searcher-minter) built by the amazing team at [Flashbots](https://flashbots.org).
- [Artbotter](https://artbotter.io) for inspiring [Yobot](https://yobot.com) and providing generous amounts of their time and resources.

#### Video Live Coding Demo

You can find a walkthrough of Flashbots and the creation of this NFT minting bot here:

[YouTube - Using Flashbots to Mint NFTs on Ethereum - Part 1](https://www.youtube.com/watch?v=1ve1YIpDs_I)

### Development Roadmap

- [x] Fetch All Open Bids from the Yobot Contracts.
  - [x] Fetch emitted Action events.
  - [x] Filter events for the given `_tokenAddress`
  - [x] Filter for only open bids.
    - [x] Iterate over events and remove if bid was cancelled or withdrawan.
  - [x] Sort them with highest offers first.
- [ ] Check if minting is currently allowed.
- [ ] Get the mint price.
- [ ] Compute basefee for the next block.
- [ ] Estimate 90th percentile priority fee for the next block.
  - [ ] Stream Mempool
  - [ ] Build a block from the Mempool - by filtering out txs with too low basefee, bad nonces, etc, and then sorting based on priority fee
  - [ ] Estimate gas costs using this simulated block
- [ ] Compute Gas cost to fill one order
- [ ] Check how many mints remaining
- [ ] Compute total profit
- [ ] Create a flashbots bundle with the list of transactions
- [x] Simulate the bundle
- [ ] Send the bundle to flashbots

### Artblocks-specific Roadmap

...

### Contract Docs


### fillOrder - How to use

The `_user` is the user's address.
The `_tokenAddress` is the address of the NFT's ERC721 contract.
The `_tokenId` is the ID of the token you're giving to the user to fill their order.

The `_expectedPriceInWeiEach` is the price per NFT you got from the user's order. Tthe purpose of this is to make sure the user didn't reduce their offer between the time you bought the NFT and the time you fill their order. If they did, then your attempt to fill will revert (to prevent you from losing money).

The `_profitTo` and` _sendNow` arguments determine whether or not you get paid for your ordering filling now or later.

If you set `_sendNow` to true, then when you fill the order, the user's money will be transferred instantly (same transaction) to whatever you set as the `_profitTo` address.

(You should always set `_sendNow` to true).


## Deployed Contracts

### Mainnet

// TODO

### Rinkeby

**YobotERC721LimitOrder** deployed and verified on rinkeby at [0x8b5842a935731ed1b92e3211a7f38bebd185eb53](https://rinkeby.etherscan.io/address/0x8b5842a935731ed1b92e3211a7f38bebd185eb53#code)

**YobotArtBlocksBroker** Deployed and verified on rinkeby at: [0x1b78c74b301aa66c3da90556be7290eb2dcc2864](https://rinkeby.etherscan.io/address/0x1b78c74b301aa66c3da90556be7290eb2dcc2864#code)

### Goerli

**YobotERC721LimitOrder** deployed and verified on goerli at [0x0d29790c2412f42248905f879260f1a6f409a11a](https://goerli.etherscan.io/address/0x0d29790c2412f42248905f879260f1a6f409a11a#code)

**YobotArtBlocksBroker** Deployed and verified on goerli at: [0x041761ca2d7730ae3788f732c1a43db002feff2f](https://goerli.etherscan.io/address/0x041761ca2d7730ae3788f732c1a43db002feff2f#code)

**WasteGas**: `0x957B500673A4919C9394349E6bbD1A66Dc7E5939`
**FakeArtMinter**: `0x20EE855E43A7af19E407E39E5110c2C1Ee41F64D`
