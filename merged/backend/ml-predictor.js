// backend/ml-predictor.js
const joblib = require("joblib");
const path = require("path");

// Load trained models
const slippageModel = joblib.loadSync(path.join(__dirname, "../ml_slippage_model.pkl"));
const priorityModel = joblib.loadSync(path.join(__dirname, "../ml_priority_model.pkl"));

function predictSettings({ pendingTxRate, avgGas, tokenType, timeOfDay }) {
  const input = [[pendingTxRate, avgGas, tokenType, timeOfDay]];
  const slippage = slippageModel.predict(input)[0];
  const priority = priorityModel.predict(input)[0];
  return {
    recommendedSlippage: slippage.toFixed(2),
    recommendedPriorityFee: priority.toFixed(6)
  };
}

module.exports = predictSettings;
