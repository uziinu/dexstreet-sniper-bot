// backend/flashbots.js
const { ethers } = require('ethers');
const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle');

// 🔐 Replace with your backend-controlled Flashbots signer
const FLASHBOTS_SIGNER = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000001');

async function sendViaFlashbots(targetTx, userPrivateKey, rpc) {
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const userWallet = new ethers.Wallet(userPrivateKey, provider);

  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    FLASHBOTS_SIGNER,
    'https://relay.flashbots.net',
    'mainnet' // change to 'goerli' for testnet
  );

  const nonce = await provider.getTransactionCount(userWallet.address);

  const txBundle = [{
    signer: userWallet,
    transaction: {
      ...targetTx,
      nonce,
      gasLimit: 300000,
      chainId: await userWallet.getChainId()
    }
  }];

  const blockNumber = await provider.getBlockNumber();
  const res = await flashbotsProvider.sendBundle(txBundle, blockNumber + 1);

  return await res.wait();
}

module.exports = sendViaFlashbots;
