# yobot-searcher • [![tests](https://github.com/nascentxyz/yobot-searcher/actions/workflows/test.yml/badge.svg)](https://github.com/nascentxyz/yobot-searcher/actions/workflows/test.yml) [![lints](https://github.com/nascentxyz/yobot-searcher/actions/workflows/lint.yml/badge.svg)](https://github.com/nascentxyz/yobot-searcher/actions/workflows/lint.yml) ![GitHub](https://img.shields.io/github/license/nascentxyz/yobot-searcher) ![GitHub package.json version](https://img.shields.io/github/package-json/v/nascentxyz/yobot-searcher)


<p align="center">Yobot Searcher is a Typescript server that posts flashbot bundles for executing <a href="https://yobot.com">Yobot</a> bids.</p>

### Architecture
```ml
scripts
├─ mint — "Script to Mint Two InfiniteMint ERC721 Tokens using Flashbots Bundles"
├─ orders — "Script to Fetch Yobot Contract Open Orders"
├─ mint — "Main Script that runs the Yobot Searcher"
src
├─ abi/* — "Contract ABIs"
├─ flashbots
│  ├─ CraftBundle — "Creates a Flashbots Bundle"
│  ├─ CraftTransaction — "Creates a Flashbots Transaction"
│  └─ ValidateSubmitResponse — "Validates that the Submitted Flashbots Bundle didn't error"
├─ mempool
│  ├─ ...
├─ utils
│  ├─ ...
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

Then, enter all the values in the `.env` file.

### Usage

Get some [Goerli](https://goerli.etherscan.io/) ETH on a wallet (you'll need a [faucet](https://faucet.goerli.mudit.blog/)). Extract that Goerli wallet's private key (in MetaMask `Account Details -> Export Private Key`), use that value below for `WALLET_PRIVATE_KEY` or simple create a `.env` file with the following content:
```
WALLET_PRIVATE_KEY=xxxxx
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



### Note:  It is EXTREMELY dangerous to deal with private keys in this manner, but bots require access to these keys to function. Be careful when using raw private keys that own mainnet ETH or other valuable assets. Keep as little value in these "hot" accounts as possible.


When using the `.env` file, you don't need to specify the `WALLET_PRIVATE_KEY` value before running `yarn start`.

```shell
yarn
WALLET_PRIVATE_KEY=0x................ yarn start
```



### Development Roadmap

### Tasks for Standard ERC721 Mints

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

### Tasks for Artblocks-specific Mints



#### Artbotter Notes

```

We usually set up a hook that executes on every new block.

Every time the node sees a new block, we grab the most recent orders and sort them (highest offers first).
Then we check to see if minting is currently allowed. If so, we check to see the current mint price.

We compute the basefee for the next block.

We estimate the 90th percentile priority fee for the next block (more info below on how we do that), which is what we'll use as our priority fee.

With that info (and an estimate of how much gas it takes to fill an order) we can compute the gas cost of filling one order.

And then we can filter out orders that don't pay at least that much.

We check to see how many mints are remaining, and if it's fewer than the number of orders we have then we reduce the list of orders.

So at that point we have a list of all orders we want to fill on the next block, and can compute (roughly) how much profit we'll make.

We create a series of transactions that would fill all those orders (more info below on what exactly those txs are) and create a flashbots bundle with those txs in them.

We simulate the bundle locally to make sure it will execute as desired without reverting.

Assuming it passes simulation (which it should if everything above is working properly) then we ship the bundle to flashbots.

The above repeats on every block.

(By the way, you can almost certainly get away with doing something simpler than this. I'm just sharing what my team does for ideas.)

(A lot of this is tooling that we created for other bots / MEV extraction. So we use it because we already built the tooling and had it available to us when we started ArtBlocks)

To compute gas prices, we have a tool that -- on each block -- grabs the current mempool and forms a block out of it in the usual way (same way a miner normally would, by filtering out all txs with too low basefee, bad nonces, etc, and then sorting based on priority fee).

Then it looks at all the priority fees in that "fake" block and grabs the lowest one from the top 90% of the block.

(It's actually a really nice tool to have, and is MUCH more accurate than any api we've found)

As for the set of transactions in the bundle, for ArtBlocks (which enforces that you can only mint from an EOA, and each EOA can only mint 1 NFT) we do the following:

All funds are held by a "main" EOA that has enough funds to buy 1 NFT (at a very high gas price).
The main EOA transfers enough ETH to mint 1 NFT and fill the first order (so mint price + gas costs). It transfers this to the first "child" EOA.

The child EOA mints an NFT.
The child EOA approves the YoBot contract.
The child EOA fills the first order. At the end of this transaction, all the proceeds are sent back to the main EOA.
The above 4 steps happen over and over again (with a different child EOA every time) until all the orders are filled. So the proceeds from filling the first order are used to fill the second order. And the proceeds from the second order are used to fill the third order. Etc, etc. (edited)

Note that step (3) can be avoided during the drop by having all the child EOAs approve the YoBot contract before the drop. That helps a lot.

There are two things to note here:
Drops that allow minting by EOA-only suck, especially when they limit the number of mints per EOA. ArtBlocks is hard to support for this reason.
Version 2 of YoBot (the one where user funds are locked and you just buy all the NFTs during the drop and fill the orders later) will be much easier to write bots for.

An easier MVP (IMHO) would be to start with version 2 and only support NFTs that are not EOA-only mintable.

```

## General Docs


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
