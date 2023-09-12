import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import {
  FixedEtherVault,
  InsecureEtherVault__factory,
} from '../typechain-types';
import { expect } from 'chai';

describe('FixedEtherVault', () => {
  const DeployFixedEtherVault = async () => {
    const FixedEtherVaultFactory =
      await ethers.getContractFactory('FixedEtherVault');
    const FixedEtherVault = await FixedEtherVaultFactory.deploy();
    const Signers = await ethers.getSigners();
    return { FixedEtherVault, Signers };
  };
  let fixedEtherVault: FixedEtherVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let signers: Signer[];

  before(async () => {
    const { FixedEtherVault, Signers } = await loadFixture(
      DeployFixedEtherVault,
    );

    fixedEtherVault = FixedEtherVault;
    signers = Signers;
  });

  describe('입금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100.0');
    it('사용자는 입금할 수 있다.', async () => {
      user = signers[1];

      await fixedEtherVault.connect(user).deposit({ value: depositAmount });
      expect(await fixedEtherVault.getBalance()).to.be.equal(depositAmount);
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
    });
  });
  describe('출금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100.0');

    it('사용자는 입금한 금액 전부를 한번에 출금할 수 있다.', async () => {
      const { Signers, FixedEtherVault } = await loadFixture(
        DeployFixedEtherVault,
      );
      user = Signers[1];
      fixedEtherVault = FixedEtherVault;

      await fixedEtherVault.connect(user).deposit({ value: depositAmount });

      expect(await fixedEtherVault.getBalance()).to.be.equal(depositAmount);
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );

      await fixedEtherVault.connect(user).withdrawAll();

      expect(await fixedEtherVault.getBalance()).to.be.equal(0n);
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(0n);
    });
    it('사용자가 입금한 잔액이 없으면 출금할 수 없다.', async () => {
      user = signers[2];
      await expect(
        fixedEtherVault.connect(user).withdrawAll(),
      ).to.be.revertedWith('Insufficient balance');
    });
    it('출금 함수 호출 시 EOA, CA가 수신하지 못할 경우 Revert된다.', async () => {
      const DeployMockContract = async () => {
        const MockContractFactory =
          await ethers.getContractFactory('MockContract');
        const MockContract = await MockContractFactory.deploy(
          'fixed',
          fixedEtherVault,
        );
        return { MockContract };
      };
      const { MockContract } = await loadFixture(DeployMockContract);
      user = signers[1];

      await fixedEtherVault.connect(user).deposit({ value: depositAmount });
      const mockContractAddress = await MockContract.getAddress();

      await fixedEtherVault
        .connect(user)
        .transfer(mockContractAddress, depositAmount);
      expect(
        await fixedEtherVault.getUserBalance(mockContractAddress),
      ).to.be.equal(depositAmount);
      await expect(MockContract.attack()).to.be.revertedWith(
        'Failed to send Ether',
      );
    });
  });
  describe('이체', () => {
    let buyer: Signer;
    let seller: Signer;

    const depositAmount = ethers.parseEther('10');
    it('잔액을 가진 유저는 다른 유저에게 이체할 수 있다.', async () => {
      const { FixedEtherVault } = await loadFixture(DeployFixedEtherVault);

      buyer = signers[1];
      seller = signers[2];
      await FixedEtherVault.connect(buyer).deposit({ value: depositAmount });

      expect(await FixedEtherVault.getBalance()).to.be.equal(depositAmount);
      await fixedEtherVault.connect(buyer).transfer(seller, depositAmount);
      expect(await FixedEtherVault.getUserBalance(seller)).to.be.equal(
        depositAmount,
      );
    });
    it('잔액이 충분하지 않은 유저는 다른 유저에게 이체할 수 없다.', async () => {
      const { FixedEtherVault } = await loadFixture(DeployFixedEtherVault);

      buyer = signers[1];
      seller = signers[2];

      await FixedEtherVault.connect(buyer).transfer(seller, depositAmount);
      expect(await FixedEtherVault.getUserBalance(seller)).to.be.equal(0n);
    });
  });
  describe('Mock', () => {
    it('커버리지 채우기 용', async () => {
      const DeployMockContract = async () => {
        const MockContractFactory =
          await ethers.getContractFactory('MockContract');
        await expect(
          MockContractFactory.deploy('fixe1', fixedEtherVault),
        ).to.be.revertedWith('Invalid contract Type');
      };
      await DeployMockContract();
    });
  });
});
