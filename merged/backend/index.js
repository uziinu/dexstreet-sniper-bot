
const { startMempoolTracking, getMempoolStats } = require('./mempool-monitor');
startMempoolTracking('wss://eth.llamarpc.com'); // Can switch by chain later
const predictSettings = require('./ml-predictor');
const Log = require('../database/models/Log');

const sendViaFlashbots = require('./flashbots');
const optimize = require('./ai-optimizer');
const connectDB = require('../database/db');
// backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ethers = require('ethers');
const Web3 = require('web3');
const { Connection, PublicKey, Keypair, sendAndConfirmTransaction } = require('@solana/web3.js');
const { exec } = require('child_process');

connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3001;

app.get('/', (req, res) => {
  res.send('DexStreet Sniper Bot Backend is Live ✅');
});

// EVM Snipe Execute
app.post('/snipe/execute', async (req, res) => {
  const { pendingTxRate, avgGas } = getMempoolStats();
  const tokenType = 0; const timeOfDay = new Date().getHours();
  const gasSuggest = predictSettings({ pendingTxRate, avgGas, tokenType, timeOfDay });
  const { chain, targetContract, amount, slippage, gasPriority, bribe, walletAddress } = req.body;

  const optimized = optimize(chain);
  const rpcMap = {
    ETH: 'https://eth.llamarpc.com',
    BASE: 'https://base.llamarpc.com',
    ARB: 'https://arb1.arbitrum.io/rpc'
  };

  const isProtected = ['ETH', 'BASE', 'ARB'].includes(chain.toUpperCase());
  if (isProtected) {
    const tx = {
      to: targetContract,
      value: ethers.utils.parseEther(amount),
      maxPriorityFeePerGas: ethers.utils.parseUnits(gasPriority, 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits((parseFloat(gasPriority) + 1).toString(), 'gwei')
    };

    try {
      await sendViaFlashbots(tx, '0xUSER_PRIVATE_KEY', rpcMap[chain.toUpperCase()]);
      return res.json({ success: true, flashbots: true });
    } catch (e) {
      return res.status(500).json({ error: 'Flashbots failed', detail: e.toString() });
    }
  }

  // Placeholder: Integrate actual logic for Ethereum, BSC, Base, Arbitrum
  return res.json({ status: 'ok', chain, executed: true });
});

// LP Check Endpoint
app.get('/history/manual', async (req, res) => {
  const history = await Log.find({ mode: 'Manual' }).sort({ timestamp: -1 }).limit(50);
  res.json(history);
});

app.post('/ml/adjust-gas', (req, res) => {
  const { pendingTxRate, avgGas, tokenType, timeOfDay } = req.body;
  const result = predictSettings({ pendingTxRate, avgGas, tokenType, timeOfDay });
  res.json(result);
});

app.get('/lp-check', async (req, res) => {
  const { chain, tokenAddress } = req.query;
  // Placeholder logic
  return res.json({ status: 'safe', liquidity: '$1.2M', riskScore: 3 });
});

// Price Check
app.get('/price-check', async (req, res) => {
  const { tokenAddress, chain } = req.query;
  return res.json({ price: '0.0028', estGas: '0.00012', estTax: '20%' });
});

app.listen(PORT, () => {
});

app.delete('/history/manual/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Log.findByIdAndDelete(id);
    res.json({ success: true, deleted: id });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
});

app.get('/pnl/:wallet', async (req, res) => {
  const { wallet } = req.params;

  // Fetch user's manual snipes
  const history = await Log.find({ status: 'success', mode: 'Manual' }).sort({ timestamp: -1 });

  // Simulate token value and show dummy profit/loss (placeholder)
  const pnlData = history.map(entry => {
    const token = entry.token;
    const amount = parseFloat(entry.amount);
    const estPriceNow = 1.0 + (Math.random() - 0.5) * 0.2; // simulate +/- 10%
    const cost = amount;
    const currentValue = amount * estPriceNow;
    const pnl = currentValue - cost;

    return {
      token,
      chain: entry.chain,
      amount,
      estPriceNow: estPriceNow.toFixed(4),
      cost: cost.toFixed(4),
      value: currentValue.toFixed(4),
      pnl: pnl.toFixed(4),
      timestamp: entry.timestamp,
      hash: entry.hash
    };
  });

  res.json(pnlData);
});
