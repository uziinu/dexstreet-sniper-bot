const hre = require("hardhat");

async function main() {
  const FeeCollector = await hre.ethers.getContractFactory("DexStreetFeeCollector");
  const feeCollector = await FeeCollector.deploy(process.env.FEE_RECEIVER);

  await feeCollector.deployed();

  console.log("✅ Deployed FeeCollector at:", feeCollector.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
