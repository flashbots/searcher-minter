

We usually set up a hook that executes on every new block.

Every time the node sees a new block,
we grab the most recent orders and sort them (highest offers first).

Then we check to see if minting is currently allowed.

If so, we check to see the current mint price.

We compute the basefee for the next block.

We estimate the 90th percentile priority fee for the next block
(more info below on how we do that), which is what we'll use as our priority fee.

With that info (and an estimate of how much gas it takes to fill an order)
we can compute the gas cost of filling one order.

And then we can filter out orders that don't pay at least that much.

We check to see how many mints are remaining,
and if it's fewer than the number of orders we have then we reduce the list of orders.

So at that point we have a list of all orders we want to fill on the next block,
and can compute (roughly) how much profit we'll make.

We create a series of transactions that would fill all those orders
(more info below on what exactly those txs are)
and create a flashbots bundle with those txs in them.

We simulate the bundle locally to make sure it will execute as desired without reverting.

Assuming it passes simulation (which it should if everything above is working properly)
then we ship the bundle to flashbots.

The above repeats on every block.

(By the way, you can almost certainly get away with doing something simpler than this.
I'm just sharing what my team does for ideas.)

(A lot of this is tooling that we created for other bots / MEV extraction.
So we use it because we already built the tooling and had it available to us when we started ArtBlocks)

To compute gas prices, we have a tool that
-- on each block --
grabs the current mempool and forms a block out of it in the usual way
(same way a miner normally would, by filtering out all txs with too low basefee,
bad nonces, etc, and then sorting based on priority fee).

Then it looks at all the priority fees in that "fake" block and grabs the lowest one
from the top 90% of the block.

(It's actually a really nice tool to have,
and is MUCH more accurate than any api we've found)

As for the set of transactions in the bundle, for ArtBlocks
(which enforces that you can only mint from an EOA, and each EOA can only mint 1 NFT)
we do the following:

All funds are held by a "main" EOA that has enough funds to buy 1 NFT (at a very high gas price).
The main EOA transfers enough ETH to mint 1 NFT and fill the first order (so mint price + gas costs). It transfers this to the first "child" EOA.

The child EOA mints an NFT.
The child EOA approves the YoBot contract.
The child EOA fills the first order.
At the end of this transaction, all the proceeds are sent back to the main EOA.
The above 4 steps happen over and over again (with a different child EOA every time)
until all the orders are filled.
So the proceeds from filling the first order are used to fill the second order.
And the proceeds from the second order are used to fill the third order.
Etc, etc. (edited)

Note that step (3) can be avoided during the drop by having all the
child EOAs approve the YoBot contract before the drop. That helps a lot.

There are two things to note here:
Drops that allow minting by EOA-only suck, especially when they limit the number of mints per EOA. ArtBlocks is hard to support for this reason.
Version 2 of YoBot (the one where user funds are locked and you just buy all the NFTs during the drop and fill the orders later) will be much easier to write bots for.

An easier MVP (IMHO) would be to start with version 2 and only support NFTs that are not EOA-only mintable.