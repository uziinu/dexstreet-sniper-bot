// database/models/Log.js
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: String,
  chain: String,
  token: String,
  amount: String,
  status: String,
  mode: String, // Manual or Auto
  hash: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', LogSchema);
