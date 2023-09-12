import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { Signer, ContractTransactionResponse, EtherscanPlugin } from 'ethers';
import { ethers } from 'hardhat';
import {
  InsecureEtherVault,
  FixedEtherVault,
  Attack,
} from '../typechain-types';
import { expect } from 'chai';

describe('Attack', () => {
  const deployEtherVault = async () => {
    const InsecureEtherVaultFactory =
      await ethers.getContractFactory('InsecureEtherVault');
    const InsecureEtherVault = await InsecureEtherVaultFactory.deploy();
    const FixedEtherVaultFactory =
      await ethers.getContractFactory('FixedEtherVault');
    const FixedEtherVault = await FixedEtherVaultFactory.deploy();
    const AttackFactory1 = await ethers.getContractFactory('Attack');
    const AttackFactory2 = await ethers.getContractFactory('Attack');
    const AttackFixed1 = await AttackFactory1.deploy(FixedEtherVault);
    const AttackFixed2 = await AttackFactory1.deploy(FixedEtherVault);
    const AttackInsecure1 = await AttackFactory1.deploy(InsecureEtherVault);
    const AttackInsecure2 = await AttackFactory2.deploy(InsecureEtherVault);
    const Signers = await ethers.getSigners();

    return {
      Signers,
      InsecureEtherVault,
      FixedEtherVault,
      AttackInsecure1,
      AttackInsecure2,
      AttackFixed1,
      AttackFixed2,
    };
  };
  let insecureEtherVault: InsecureEtherVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  let fixedEtherVault: FixedEtherVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let attack1: Attack & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let attack2: Attack & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let signers: Signer[];

  before(async () => {
    console.log('before');
    const {
      Signers,
      InsecureEtherVault,
      FixedEtherVault,
      AttackInsecure1,
      AttackInsecure2,
    } = await loadFixture(deployEtherVault);
    signers = Signers;
    insecureEtherVault = InsecureEtherVault;
    fixedEtherVault = FixedEtherVault;
    attack1 = AttackInsecure1;
    attack2 = AttackInsecure2;
  });

  describe('공격 준비', () => {
    let first_user;
    let second_user;
    it('first user와 second user가 20 ETH씩 공급한다.', async () => {
      first_user = signers[1];
      second_user = signers[2];
      const depositAmount = ethers.parseEther('20.0');
      // 첫번째 유저 20 ETH 입금
      await insecureEtherVault
        .connect(first_user)
        .deposit({ value: depositAmount });
      // 확인
      expect(await insecureEtherVault.getUserBalance(first_user)).to.be.equal(
        depositAmount,
      );
      // 두번째 유저 20 ETH 입금
      await insecureEtherVault
        .connect(second_user)
        .deposit({ value: depositAmount });

      // 확인
      expect(await insecureEtherVault.getUserBalance(second_user)).to.be.equal(
        depositAmount,
      );
      // insecureEtherVault 컨트랙트에 들어 있는 총 잔액 확인
      expect(await insecureEtherVault.getBalance()).to.be.equal(
        depositAmount * 2n,
      );
    });
    it('Attack[1] 컨트랙트에 Attack[2] 컨트랙트를 Peer로 설정할 수 있다', async () => {
      await attack1.setAttackPeer(attack2);
      expect(await attack1.attackPeer()).to.be.equal(
        await attack2.getAddress(),
      );
    });
  });
  describe('공격', () => {
    let attacker: Signer;
    it('공격자는 Attack[1] 컨트랙트에 ETH를 공급하지 않으면 공격할 수 없다. (value < 1)', async () => {
      attacker = signers[1];
      await expect(attack1.connect(attacker).attackInit()).to.be.revertedWith(
        'Require 1 Ether to attack',
      );
    });

    it('공격자는 2 ETH 이상 공급하면 공격할 수 없다. (value >= 2)', async () => {
      attacker = signers[1];
      await expect(
        attack1
          .connect(attacker)
          .attackInit({ value: ethers.parseEther('2.0') }),
      ).to.be.revertedWith('Require 1 Ether to attack');
    });

    it('공격자는 공격을 시작하여 InsecureEtherVault Contract의 ETH를 모두 소진시킬 수 있다. (value == 1)', async () => {
      let balance: bigint = await insecureEtherVault.getBalance();
      // insecureEtherVault의 초기 값 저장
      const initBalance = balance;

      while (balance != 0n) {
        // 1 ETH 공급
        await attack1.attackInit({ value: ethers.parseEther('1.0') });

        await attack2.attackNext();

        balance = await insecureEtherVault.getBalance();
      }
      // insecureEtherVault Contract의 잔고가 0인지 확인
      expect(balance).to.be.equal(0n);
      // insecureEtherVault Contract가 공격 시작전에 가지고 있던 잔액과 같은지 확인
      expect(await attack1.getBalance()).to.be.equal(initBalance);
      expect(await attack2.getBalance()).to.be.equal(initBalance);
    });
    it('공격자는 FixedEtherVault Contract에 재진입 공격 시 실패한다.', async () => {
      const { FixedEtherVault, AttackFixed1, AttackFixed2, Signers } =
        await loadFixture(deployEtherVault);

      const first_user = Signers[1];
      const second_user = Signers[2];
      const attacker = Signers[3];
      const depositAmount = ethers.parseEther('20.0');
      // first_user가 20 ETH를 입금한다.
      await FixedEtherVault.connect(first_user).deposit({
        value: depositAmount,
      });
      expect(await FixedEtherVault.getBalance()).to.be.equal(depositAmount);

      // second_user가 20 ETH를 입금한다.
      await FixedEtherVault.connect(second_user).deposit({
        value: depositAmount,
      });
      expect(await FixedEtherVault.getBalance()).to.be.equal(
        depositAmount * 2n,
      );

      await AttackFixed1.setAttackPeer(AttackFixed2);

      await AttackFixed1.connect(attacker).attackInit({
        value: ethers.parseEther('1.0'),
      });
      // Attack1은 단순히 입금 후 출금한 것으로 간주하기 때문에 잔고가 1ETH가 있어야한다.
      expect(await AttackFixed1.getBalance()).to.be.equal(
        ethers.parseEther('1.0'),
      );
      // transfer가 실행되지 않았기 때문에 잔고가 0이 있어야한다.
      expect(await AttackFixed2.getBalance()).to.be.equal(
        ethers.parseEther('0'),
      );
    });
  });
});
