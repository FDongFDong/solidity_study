import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { Attack, InsecureMoonVault, MoonToken } from '../typechain-types';
import { expect } from 'chai';

describe('Attack', () => {
  const DeployContract = async () => {
    const MoonTokenFactory = await ethers.getContractFactory('MoonToken');
    const MoonToken = await MoonTokenFactory.deploy();
    const InsecureMoonVaultFactory = await ethers.getContractFactory(
      'InsecureMoonVault'
    );

    const FixedMoonVaultFactory = await ethers.getContractFactory(
      'FixedMoonVault'
    );
    const FixedMoonVault = await FixedMoonVaultFactory.deploy(MoonToken);

    const InsecureMoonVault = await InsecureMoonVaultFactory.deploy(MoonToken);
    const Attack_1_Factory = await ethers.getContractFactory('Attack');
    const Attack_1 = await Attack_1_Factory.deploy(
      MoonToken,
      InsecureMoonVault
    );
    const Attack_2_Factory = await ethers.getContractFactory('Attack');
    const Attack_2 = await Attack_2_Factory.deploy(
      MoonToken,
      InsecureMoonVault
    );
    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    return {
      FixedMoonVault,
      InsecureMoonVault,
      Signers,
      MoonToken,
      deployer,
      Attack_1,
      Attack_2,
    };
  };
  let signers: Signer[];
  let insecureMoonVault: InsecureMoonVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let moonToken: MoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let attack_1: Attack & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { InsecureMoonVault, Signers, MoonToken, Attack_1 } =
      await loadFixture(DeployContract);
    await MoonToken.transferOwnership(await InsecureMoonVault.getAddress());
    signers = Signers;
    insecureMoonVault = InsecureMoonVault;
    moonToken = MoonToken;
    attack_1 = Attack_1;
  });

  describe('공격 준비', () => {
    it('Attack 컨트랙트에는 MoonToken 컨트랙트와 InsecureMoonVault 컨트랙트가 등록되어 있다.', async () => {
      const { Attack_1, Attack_2 } = await loadFixture(DeployContract);

      expect(await Attack_1.moonToken()).to.be.equal(
        await moonToken.getAddress()
      );
      expect(await Attack_1.moonVault()).to.be.equal(
        await insecureMoonVault.getAddress()
      );
      expect(await Attack_2.moonToken()).to.be.equal(
        await moonToken.getAddress()
      );
      expect(await Attack_2.moonVault()).to.be.equal(
        await insecureMoonVault.getAddress()
      );
    });
    it('Attack[1] 컨트랙트에는 Attack[2] 컨트랙트가 등록되어 있다.', async () => {
      const { Attack_1, Attack_2 } = await loadFixture(DeployContract);

      await Attack_1.setAttackPeer(await Attack_2.getAddress());
      expect(await attack_1.attackPeer()).to.be.equal(
        await Attack_2.getAddress()
      );
    });
  });
  describe('공격', () => {
    let attacker: Signer;
    it('공격자는 1 ETH가 없으면 공격할 수 없다. (msg.value < 1)', async () => {
      await expect(
        attack_1.attackInit({ value: ethers.parseEther('0') })
      ).to.be.revertedWith('Require 1 Ether to attack');
    });
    it('공격자는 공격시 1 ETH를 가지고 공격할 수 있다.', async () => {
      const first_user = signers[4];
      const second_user = signers[5];

      attacker = signers[3];
      const { Attack_1, Attack_2, MoonToken, InsecureMoonVault } =
        await loadFixture(DeployContract);
      await MoonToken.transferOwnership(await InsecureMoonVault.getAddress());
      expect(await MoonToken.owner()).to.be.equal(
        await InsecureMoonVault.getAddress()
      );

      await InsecureMoonVault.connect(first_user).deposit({
        value: ethers.parseEther('20'),
      });
      await InsecureMoonVault.connect(second_user).deposit({
        value: ethers.parseEther('20'),
      });

      await Attack_1.setAttackPeer(await Attack_2.getAddress());
      expect(await Attack_1.attackPeer()).to.be.equal(
        await Attack_2.getAddress()
      );
      expect(await Attack_1.moonToken()).to.be.equal(
        await MoonToken.getAddress()
      );

      expect(await Attack_1.moonVault()).to.be.equal(
        await InsecureMoonVault.getAddress()
      );

      expect(await Attack_2.moonToken()).to.be.equal(
        await MoonToken.getAddress()
      );

      expect(await Attack_2.moonVault()).to.be.equal(
        await InsecureMoonVault.getAddress()
      );

      expect(
        await MoonToken.balanceOf(await Attack_1.getAddress())
      ).to.be.equal(ethers.parseEther('0'));
      expect(
        await MoonToken.balanceOf(await Attack_2.getAddress())
      ).to.be.equal(ethers.parseEther('0'));

      let balance = await InsecureMoonVault.getBalance();

      expect(await InsecureMoonVault.getBalance()).to.be.equal(
        ethers.parseEther('40')
      );

      while (balance != 0n) {
        await Attack_1.connect(attacker).attackInit({
          value: ethers.parseEther('1'),
        });
        await Attack_2.attackNext();
        balance = await InsecureMoonVault.getBalance();
      }

      expect(await Attack_2.getBalance()).to.be.equal(ethers.parseEther('40'));
      expect(await InsecureMoonVault.getBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
  });
  describe('공격 실패', () => {
    let attacker: Signer;
    it('공격자는 InsecureMoonVault 컨트랙트에 했던 공격을 FixedMoonVault 컨트랙트에 시도하면 실패한다.', async () => {
      const first_user = signers[4];
      const second_user = signers[5];

      attacker = signers[3];
      const { FixedMoonVault, MoonToken } = await loadFixture(DeployContract);
      const FixedAttack_1_Factory = await ethers.getContractFactory('Attack');
      const FixedAttack_2_Factory = await ethers.getContractFactory('Attack');
      const FixedAttack_1 = await FixedAttack_1_Factory.deploy(
        MoonToken,
        FixedMoonVault
      );
      const FixedAttack_2 = await FixedAttack_2_Factory.deploy(
        MoonToken,
        FixedMoonVault
      );

      await MoonToken.transferOwnership(await FixedMoonVault.getAddress());
      expect(await MoonToken.owner()).to.be.equal(
        await FixedMoonVault.getAddress()
      );

      await FixedMoonVault.connect(first_user).deposit({
        value: ethers.parseEther('20'),
      });
      await FixedMoonVault.connect(second_user).deposit({
        value: ethers.parseEther('20'),
      });

      await FixedAttack_1.setAttackPeer(await FixedAttack_2.getAddress());
      expect(await FixedAttack_1.attackPeer()).to.be.equal(
        await FixedAttack_2.getAddress()
      );
      expect(await FixedAttack_1.moonToken()).to.be.equal(
        await MoonToken.getAddress()
      );

      expect(await FixedAttack_1.moonVault()).to.be.equal(
        await FixedMoonVault.getAddress()
      );

      expect(await FixedAttack_2.moonToken()).to.be.equal(
        await MoonToken.getAddress()
      );

      expect(await FixedAttack_2.moonVault()).to.be.equal(
        await FixedMoonVault.getAddress()
      );

      expect(
        await MoonToken.balanceOf(await FixedAttack_1.getAddress())
      ).to.be.equal(ethers.parseEther('0'));
      expect(
        await MoonToken.balanceOf(await FixedAttack_2.getAddress())
      ).to.be.equal(ethers.parseEther('0'));

      expect(await FixedMoonVault.getBalance()).to.be.equal(
        ethers.parseEther('40')
      );

      await FixedAttack_1.connect(attacker).attackInit({
        value: ethers.parseEther('1'),
      });
      await expect(FixedAttack_2.attackNext()).to.be.revertedWith(
        'Insufficient balance'
      );
    });
  });
});
