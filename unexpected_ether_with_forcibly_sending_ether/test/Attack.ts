import { expect } from 'chai';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { Attack, FixedMoonToken, InsecureMoonToken } from '../typechain-types';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Attack', () => {
  const DeployContract = async () => {
    const MoonTokenFactory = await ethers.getContractFactory(
      'InsecureMoonToken'
    );
    const MoonToken = await MoonTokenFactory.deploy();
    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(MoonToken);
    const Signers = await ethers.getSigners();
    return { MoonToken, Attack, Signers };
  };

  let moonToken: InsecureMoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let signers: Signer[];
  let attack: Attack & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let first_user: Signer;
  let second_user: Signer;
  before(async () => {
    const { MoonToken, Signers, Attack } = await loadFixture(DeployContract);
    moonToken = MoonToken;
    signers = Signers;
    attack = Attack;
  });
  describe('사전 준비', () => {
    it('2명의 사용자가 InsecureMoonToken에 ETH를 공급할 수 있다.', async () => {
      first_user = signers[0];
      second_user = signers[1];
      await moonToken
        .connect(first_user)
        .buy(30, { value: ethers.parseEther('30') });
      expect(await moonToken.getUserBalance(first_user.getAddress())).to.equal(
        30
      );
      await moonToken
        .connect(second_user)
        .buy(25, { value: ethers.parseEther('25') });
      expect(await moonToken.getUserBalance(second_user.getAddress())).to.equal(
        25
      );
      expect(await moonToken.totalSupply()).to.equal(55);
    });
  });
  describe('Attack', () => {
    it('일정량의 ETH를 공급하지 않으면 공격을 할 수 없다.', async () => {
      await expect(attack.attack()).to.be.revertedWith(
        'Require some Ether to attack'
      );
    });
    it('소수점의 이더를 InsecureMoonToken을 공급하여 판매기능을 고장낼 수 있다.', async () => {
      await attack.attack({ value: ethers.parseEther('0.1') });

      expect(await moonToken.getEtherBalance()).to.equal(
        ethers.parseEther('55.1')
      );

      await expect(moonToken.connect(first_user).sell(30)).to.be.reverted;
    });
  });
  describe('수정된 MoonToken Contract', () => {
    let fixedMoonToken: FixedMoonToken & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let fixedAttack: Attack & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    before(async () => {
      const FixedMoonTokenFactory = await ethers.getContractFactory(
        'FixedMoonToken'
      );
      const FixedMoonToken = await FixedMoonTokenFactory.deploy();
      const FixedAttackFactory = await ethers.getContractFactory('Attack');
      const FixedAttack = await FixedAttackFactory.deploy(FixedMoonToken);
      fixedAttack = FixedAttack;
      fixedMoonToken = FixedMoonToken;
    });
    it('일정량의 ETH를 공급하지 않으면 공격을 할 수 없다.', async () => {
      await expect(attack.attack()).to.be.revertedWith(
        'Require some Ether to attack'
      );
    });
  });
});
