import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { Attack } from '../typechain-types';
import { Signer } from 'ethers';

describe('Attack', () => {
  const deployAttack = async () => {
    const Signer = await ethers.getSigners();
    const InsecureEtherVaultFactory =
      await ethers.getContractFactory('InsecureEtherVault');
    const InsecureEtherVault = await InsecureEtherVaultFactory.deploy();
    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(InsecureEtherVault);
    return { Signer, Attack };
  };
  let attack: Attack;
  let signer: Signer[];
  before(async () => {
    const { Attack, Signer } = await loadFixture(deployAttack);
    attack = Attack;
    signer = Signer;
  });

  describe('공격', () => {});
});
