// backend/presale-sniper.js
const { ethers } = require('ethers');

// Watch for tradingEnabled or liquidityAdded in token contracts
async function watchPresaleLaunch(contractAddress, rpc, walletPrivateKey) {
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  const iface = new ethers.utils.Interface([
    "event TradingEnabled(bool enabled)",
    "event LiquidityAdded(address indexed token, uint256 amount)"
  ]);

  provider.on("pending", async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.to || tx.to.toLowerCase() !== contractAddress.toLowerCase()) return;

      const data = tx.data;
      if (data.includes("0x") && iface.parseTransaction({ data })) {
        // Auto-send buy TX here
      }
    } catch (err) {}
  });
}

module.exports = watchPresaleLaunch;
