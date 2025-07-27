require("dotenv").config();

async function main() {
  const DexStreetSellRouter = await ethers.getContractFactory("DexStreetSellRouter");
  const router = await DexStreetSellRouter.deploy(process.env.TREASURY_WALLET);
  await router.deployed();
  console.log("✅ Sell Router deployed to:", router.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
