require("dotenv").config();

async function main() {
  const DexStreetSniperRouter = await ethers.getContractFactory("DexStreetSniperRouter");
  const router = await DexStreetSniperRouter.deploy(process.env.TREASURY_WALLET);
  await router.deployed();
  console.log("✅ Buy Router deployed to:", router.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
