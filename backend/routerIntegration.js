
// Sniper bot integration with smart contract routers
const { ethers } = require("ethers");
const sniperRouterABI = require('./config/sniperRouterABI.json');
const sellRouterABI = require('./config/sellRouterABI.json');

// Example provider and signer (configure properly in real setup)
const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract addresses
const SNIPER_ROUTER_ADDRESS = "0xYourDeployedSniperRouter";
const SELL_ROUTER_ADDRESS = "0xYourDeployedSellRouter";

// Sample function to buy via router
async function snipeViaRouter(token, router, path, minOut, ethAmount, deadline, referrer) {
  const sniperRouter = new ethers.Contract(SNIPER_ROUTER_ADDRESS, sniperRouterABI, wallet);
  const tx = await sniperRouter.snipeETHToToken(
    router,
    token,
    minOut,
    path,
    deadline,
    referrer,
    { value: ethAmount }
  );
  console.log("Snipe TX:", tx.hash);
  await tx.wait();
  console.log("✅ Buy complete");
}

// Sample function to sell via router
async function sellViaRouter(token, router, path, amountIn, minOut, deadline, referrer) {
  const sellRouter = new ethers.Contract(SELL_ROUTER_ADDRESS, sellRouterABI, wallet);

  // Approve token for router
  const tokenContract = new ethers.Contract(token, [
    "function approve(address spender, uint amount) public returns (bool)"
  ], wallet);

  await tokenContract.approve(SELL_ROUTER_ADDRESS, amountIn);

  const tx = await sellRouter.sellTokenForETH(
    router,
    token,
    amountIn,
    minOut,
    path,
    deadline,
    referrer
  );
  console.log("Sell TX:", tx.hash);
  await tx.wait();
  console.log("✅ Sell complete");
}
