import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { InsecureMoonVault, MoonToken } from '../typechain-types';

describe('Attack', () => {
  const DeployContract = async () => {
    const MoonTokenFactory = await ethers.getContractFactory('MoonToken');
    const MoonToken = await MoonTokenFactory.deploy();
    const InsecureMoonVaultFactory = await ethers.getContractFactory(
      'InsecureMoonVault'
    );
    const InsecureMoonVault = await InsecureMoonVaultFactory.deploy(MoonToken);
    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(MoonToken, InsecureMoonVault);
    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    return { InsecureMoonVault, Signers, MoonToken, deployer };
  };
  let signers: Signer[];
  let insecureMoonVault: InsecureMoonVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let moonToken: MoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { InsecureMoonVault, Signers, MoonToken } = await loadFixture(
      DeployContract
    );
    signers = Signers;
    insecureMoonVault = InsecureMoonVault;
    moonToken = MoonToken;
  });

  describe('', () => {});
});
