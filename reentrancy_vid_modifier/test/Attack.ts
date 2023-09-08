import { ethers } from 'hardhat';
import { Attack, InsecureAirdrop, FixedAirdrop } from '../typechain-types';
import { Signer, ContractTransactionResponse } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

describe('Attack', () => {
  const airdropAmount = ethers.toBigInt(10000);
  const deployAttack = async () => {
    const InsecureAirdropFactory =
      await ethers.getContractFactory('InsecureAirdrop');
    const InsecureAirdrop = await InsecureAirdropFactory.deploy(airdropAmount);
    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(InsecureAirdrop);
    const Signers = await ethers.getSigners();
    return { Attack, Signers, InsecureAirdrop };
  };

  let attack: Attack;
  let signers: Signer[];
  let insecureAirdrop: InsecureAirdrop;

  before(async () => {
    const { Attack, Signers, InsecureAirdrop } =
      await loadFixture(deployAttack);
    attack = Attack;
    signers = Signers;
    insecureAirdrop = InsecureAirdrop;
  });
  describe('Constructor', () => {
    it('Attack Contract 생성 시 InsecureAirdrop Contract의 Address를 넣을 수 있다.', async () => {
      expect(await attack.airdrop()).to.be.equal(
        await insecureAirdrop.getAddress()
      );
    });
    it('', async () => {});
  });
  describe('Attack', () => {
    it('공격을 5번 시도하면 에어드랍을 5번 받을 수 있다.', async () => {
      const attackCount = 5;
      expect(await insecureAirdrop.airdropAmount()).to.be.equal(airdropAmount);
      expect(await attack.getBalance()).to.be.equal(ethers.toBigInt(0));

      await attack.attack(5);
      expect(await attack.getBalance()).to.be.equal(
        ethers.toBigInt(attackCount) * airdropAmount
      );
    });
  });
  describe('Solution', () => {
    const deployFixedAttack = async () => {
      const FixedAirdropFactory =
        await ethers.getContractFactory('FixedAirdrop');
      const FixedAirdrop = await FixedAirdropFactory.deploy(airdropAmount);
      const AttackFactory = await ethers.getContractFactory('Attack');
      const Attack = await AttackFactory.deploy(
        await FixedAirdrop.getAddress()
      );
      return { Attack, FixedAirdrop };
    };
    let fixedAttack: Attack & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let fixedAirdrop: FixedAirdrop & {
      deploymentTransaction(): ContractTransactionResponse;
    };

    before(async () => {
      const { Attack, FixedAirdrop } = await loadFixture(deployFixedAttack);
      fixedAttack = Attack;
      fixedAirdrop = FixedAirdrop;
    });
    it('공격을 시도해도 1번만 에어드랍을 받을 수 있다.', async () => {
      await expect(fixedAttack.attack(5)).to.be.revertedWith('No re-entrancy');
      console.log(await fixedAttack.getBalance());
    });
  });
});
