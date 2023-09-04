import { ethers } from 'hardhat';

const main = async () => {
  const InsecureEtherVault = await ethers.deployContract('InsecureEtherVault');
  await InsecureEtherVault.waitForDeployment();
  console.log(InsecureEtherVault.target);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
