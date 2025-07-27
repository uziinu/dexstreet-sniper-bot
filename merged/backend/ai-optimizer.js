// backend/ai-optimizer.js
module.exports = function getOptimizedGasSettings(chain) {
  if (chain === 'ETH' || chain === 'BASE' || chain === 'ARB') {
    return {
      priorityFee: '0.0015',
      slippage: '15',
      bribe: '0.02',
      mevProtected: true,
      route: 'flashbots'
    };
  } else if (chain === 'SOL') {
    return {
      priorityFee: 'auto',
      slippage: '10',
      bribe: '0',
      mevProtected: true,
      route: 'jito'
    };
  } else {
    return {
      priorityFee: '0.001',
      slippage: '20',
      bribe: '0.05',
      mevProtected: false,
      route: 'standard'
    };
  }
};
