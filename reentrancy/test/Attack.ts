import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

import { Contract, Signer, Wallet } from 'ethers';
import { Attack, InsecureEtherVault } from '../typechain-types';

describe('Attack', () => {
  const deployAttack = async () => {
    const Signer = await ethers.getSigners();
    const AttackContract = await ethers.getContractFactory('Attack');
    const InsecureEtherVaultContract = await ethers.getContractFactory(
      'InsecureEtherVault'
    );
    const InsecureEtherVault = await InsecureEtherVaultContract.deploy();
    const Attack = await AttackContract.deploy(InsecureEtherVault);
    return { Signer, InsecureEtherVault, Attack };
  };
  let insecureEtherVault: InsecureEtherVault;
  let attack: Attack;
  let signer: Signer[];

  before(async () => {
    const { Attack, InsecureEtherVault, Signer } = await loadFixture(
      deployAttack
    );
    insecureEtherVault = InsecureEtherVault;
    attack = Attack;
    signer = Signer;
  });

  describe('Constructor', () => {
    it('constructor로 InsecureEtherVault Contract를 등록할 수 있다.', async () => {
      const { Attack, InsecureEtherVault, Signer } = await loadFixture(
        deployAttack
      );
      insecureEtherVault = InsecureEtherVault;
      attack = Attack;
      signer = Signer;
      expect(await insecureEtherVault.getAddress()).to.be.equal(
        await Attack.etherVault()
      );
    });
  });

  describe('출금', () => {
    it('출금 시 owner로 등록되어 있지 않으면 출금할 수 없다.', async () => {
      const { Attack, InsecureEtherVault, Signer } = await loadFixture(
        deployAttack
      );
      insecureEtherVault = InsecureEtherVault;
      attack = Attack;
      signer = Signer;
      const randomWallet = Wallet.createRandom().connect(ethers.provider);
      await expect(
        attack.connect(randomWallet).withdrawAll()
      ).to.be.rejectedWith('You are not owner');
    });
  });

  describe('공격', () => {
    it('공격자가 1이더를 공급하지 못하면 revert된다..', async () => {
      const { Attack } = await loadFixture(deployAttack);

      attack = Attack;

      const randomWallet = Wallet.createRandom().connect(ethers.provider);

      await expect(attack.connect(randomWallet).attack()).to.be.revertedWith(
        'Require 1 Ether to attack'
      );
    });

    it('피해자는 InsecureEtherVault Contract에 이더를 공급할 수 있다.', async () => {
      const victim = signer[1];

      await insecureEtherVault
        .connect(victim)
        .deposit({ value: ethers.parseEther('5.0') });
      expect(await insecureEtherVault.getBalance()).to.equal(
        ethers.parseEther('5.0')
      );
    });
    it('공격자는 InsecureEtherVault Contract에 있는 모든 이더를 가져올 수 있다..', async () => {
      const { Attack, InsecureEtherVault, Signer } = await loadFixture(
        deployAttack
      );
      insecureEtherVault = InsecureEtherVault;
      attack = Attack;
      signer = Signer;
      const victim = signer[1];
      const attacker = signer[0];

      let victimAmount: bigint = await ethers.provider.getBalance(victim);
      // 피해자가 100이더를 입금한다.
      await insecureEtherVault
        .connect(victim)
        .deposit({ value: ethers.parseEther('100.0') });

      victimAmount = await ethers.provider.getBalance(victim);
      let insecureEtherVaultAmount: bigint = await ethers.provider.getBalance(
        insecureEtherVault
      );
      console.log(
        `insecureEtherVault 컨트랙트에 입금되어 있는 금액 : ${ethers.formatEther(
          insecureEtherVaultAmount
        )}`
      );

      let attachContractAmount: bigint = await ethers.provider.getBalance(
        attack
      );
      console.log(
        `공격 전 Attack 컨트랙트에 생긴 잔고 : ${ethers.formatEther(
          attachContractAmount
        )}`
      );

      let attackerAmount: bigint = await ethers.provider.getBalance(attacker);

      // 공격 시작
      await attack
        .connect(attacker)
        .attack({ value: ethers.parseEther('1.0') });
      console.log('------------Attack 함수 호출----------------');

      attackerAmount = await ethers.provider.getBalance(attacker);
      console.log(`[공격자의 잔고 : ${ethers.formatEther(attackerAmount)}]`);
      insecureEtherVaultAmount = await ethers.provider.getBalance(
        insecureEtherVault
      );
      console.log(
        `insecureEtherVault 컨트랙트에 입금되어 있는 금액 : ${ethers.formatEther(
          insecureEtherVaultAmount
        )}`
      );
      attachContractAmount = await attack.getBalance();
      console.log(
        `공격 후 Attack 컨트랙트에 생긴 잔고 : ${ethers.formatEther(
          attachContractAmount
        )}`
      );

      await attack.connect(attacker).withdrawAll();
      attackerAmount = await ethers.provider.getBalance(attacker);
      console.log(`[공격자의 잔고 : ${ethers.formatEther(attackerAmount)}]`);
    });
  });
});
