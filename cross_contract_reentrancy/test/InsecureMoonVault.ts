import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { InsecureMoonVault, MoonToken } from '../typechain-types';

describe('InsecureMoonVault', () => {
  const DeployContract = async () => {
    const MoonTokenFactory = await ethers.getContractFactory('MoonToken');
    const MoonToken = await MoonTokenFactory.deploy();
    const InsecureMoonVaultFactory = await ethers.getContractFactory(
      'InsecureMoonVault'
    );
    const InsecureMoonVault = await InsecureMoonVaultFactory.deploy(MoonToken);
    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    return { Signers, InsecureMoonVault, MoonToken };
  };
  let signers: Signer[];
  let insecureMoonVault: InsecureMoonVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let moonToken: MoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { Signers, InsecureMoonVault, MoonToken } = await loadFixture(
      DeployContract
    );
    signers = Signers;
    insecureMoonVault = InsecureMoonVault;
    moonToken = MoonToken;
  });
});
