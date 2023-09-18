import { ethers } from 'hardhat';

async function main() {
  const logic_V1 = await ethers.deployContract('LogicV1');

  await logic_V1.waitForDeployment();

  const proxy = await ethers.deployContract('Proxy');
  console.log();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
