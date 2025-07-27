// backend/mempool-monitor.js
const { ethers } = require('ethers');

let txPerSecond = 0;
let avgGas = 30;

const pendingCounter = {
  count: 0,
  startTime: Date.now()
};

function startMempoolTracking(rpc) {
  const provider = new ethers.providers.WebSocketProvider(rpc);

  provider.on('pending', (tx) => {
    pendingCounter.count++;

    const now = Date.now();
    const elapsed = (now - pendingCounter.startTime) / 1000;
    if (elapsed >= 1) {
      txPerSecond = pendingCounter.count;
      pendingCounter.count = 0;
      pendingCounter.startTime = now;
    }
  });

  async function updateGas() {
    try {
      const block = await provider.getBlock("latest");
      avgGas = Number(block.baseFeePerGas || 30) / 1e9;
    } catch (e) {
      avgGas = 30;
    }

    setTimeout(updateGas, 5000);
  }

  updateGas();
}

function getMempoolStats() {
  return {
    pendingTxRate: txPerSecond,
    avgGas: parseFloat(avgGas.toFixed(2))
  };
}

module.exports = { startMempoolTracking, getMempoolStats };
