// backend/rug-detector.js
const axios = require('axios');

async function detectRug(tokenAddress, chain) {
  try {
    const res = await axios.get(`https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${tokenAddress}`);
    const info = res.data.result[tokenAddress.toLowerCase()];

    const riskScore = (
      Number(info.is_open_source === '1') +
      Number(info.owner_change_balance === '1') +
      Number(info.slippage_modifiable === '1') +
      Number(info.is_honeypot === '1') +
      Number(info.can_take_back_ownership === '1')
    );

    const label = riskScore >= 3 ? "🚨 High Risk" : riskScore === 2 ? "⚠️ Moderate" : "✅ Safe";

    return {
      score: 5 - riskScore,
      label,
      info
    };
  } catch (e) {
    return { error: "Rug check failed" };
  }
}

module.exports = detectRug;
