# <h1 align="center"> Yobot Searcher </h1>

<p align="center">Yobot Searcher is a Typescript server that posts flashbot bundles for executing <a href="https://yobot.co">Yobot</a> bids.</p>

<div align="center">

![Lints](https://github.com/nascentxyz/yobot-searcher/workflows/Linting/badge.svg)
![Tests](https://github.com/nascentxyz/yobot-searcher/workflows/Tests/badge.svg)

</div>


## Credits

- [Forked searcher-minter repo](https://github.com/flashbots/searcher-minter) built by the amazing team at [Flashbots](https://flashbots.org).
- [Artbotter](https://artbotter.io) for inspiring [Yobot](https://yobot.co) and providing generous amounts of their time and resources.

## Video Live Coding Demo

You can find a walkthrough of Flashbots and the creation of this NFT minting bot here:

[YouTube - Using Flashbots to Mint NFTs on Ethereum - Part 1](https://www.youtube.com/watch?v=1ve1YIpDs_I)

## How to run

Get some [Goerli](https://goerli.etherscan.io/) ETH on a wallet (you'll need a [faucet](https://faucet.goerli.mudit.blog/)). Extract that Goerli wallet's private key (in MetaMask `Account Details -> Export Private Key`), use that value below for `WALLET_PRIVATE_KEY`.

### Note:  It is EXTREMELY dangerous to deal with private keys in this manner, but bots require access to these keys to function. Be careful when using raw private keys that own mainnet ETH or other valuable assets. Keep as little value in these "hot" accounts as possible.

```shell
npm install
WALLET_PRIVATE_KEY=0x1d9af4................ npx ts-node src/index.ts
```

## Goerli Contract Addresses

* WasteGas: `0x957B500673A4919C9394349E6bbD1A66Dc7E5939`
* FakeArtMinter: `0x20EE855E43A7af19E407E39E5110c2C1Ee41F64D`

## Where can I learn more?

Check out [docs.flashbots.net](https://docs.flashbots.net).
