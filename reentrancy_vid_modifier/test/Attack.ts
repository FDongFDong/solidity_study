import { ethers } from 'hardhat';
import { Attack } from '../typechain-types';
import { Signer } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Attack', () => {
  const deployAttack = async () => {
    const InsecureAirdropFactory =
      await ethers.getContractFactory('InsecureAirdrop');
    const InsecureAirdrop = await InsecureAirdropFactory.deploy(
      ethers.toBigInt(100)
    );
    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(InsecureAirdrop);
    const Signers = await ethers.getSigners();
    return { Attack, Signers };
  };

  let attack: Attack;
  let signers: Signer[];

  before('', async () => {
    const { Attack, Signers } = await loadFixture(deployAttack);
    attack = Attack;
    signers = Signers;
  });
});
