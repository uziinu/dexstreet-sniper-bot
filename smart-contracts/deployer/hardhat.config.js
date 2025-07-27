require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    ethereum: {
      url: process.env.ETH_RPC,
      accounts: [process.env.PRIVATE_KEY]
    },
    bsc: {
      url: process.env.BSC_RPC,
      accounts: [process.env.PRIVATE_KEY]
    },
    base: {
      url: process.env.BASE_RPC,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
