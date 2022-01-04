# <h1 align="center"> Yobot Searcher </h1>

<p align="center">Yobot Searcher is a Typescript server that posts flashbot bundles for executing <a href="https://yobot.co">Yobot</a> bids.</p>

<div align="center">

![Lints](https://github.com/nascentxyz/yobot-searcher/workflows/lint/badge.svg)
![Tests](https://github.com/nascentxyz/yobot-searcher/workflows/test/badge.svg)

</div>


## Credits

- [Forked searcher-minter repo](https://github.com/flashbots/searcher-minter) built by the amazing team at [Flashbots](https://flashbots.org).
- [Artbotter](https://artbotter.io) for inspiring [Yobot](https://yobot.co) and providing generous amounts of their time and resources.

## Video Live Coding Demo

You can find a walkthrough of Flashbots and the creation of this NFT minting bot here:

[YouTube - Using Flashbots to Mint NFTs on Ethereum - Part 1](https://www.youtube.com/watch?v=1ve1YIpDs_I)

## How to run

Get some [Goerli](https://goerli.etherscan.io/) ETH on a wallet (you'll need a [faucet](https://faucet.goerli.mudit.blog/)). Extract that Goerli wallet's private key (in MetaMask `Account Details -> Export Private Key`), use that value below for `WALLET_PRIVATE_KEY` or simple create a `.env` file with the following content:
```
WALLET_PRIVATE_KEY=xxxxx
```


### Note:  It is EXTREMELY dangerous to deal with private keys in this manner, but bots require access to these keys to function. Be careful when using raw private keys that own mainnet ETH or other valuable assets. Keep as little value in these "hot" accounts as possible.


When using the `.env` file, you don't need to specify the `WALLET_PRIVATE_KEY` value before running `yarn start`.

```shell
yarn
WALLET_PRIVATE_KEY=0x1d9af4................ yarn start
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

## Where can I learn more?

Check out [docs.flashbots.net](https://docs.flashbots.net).
