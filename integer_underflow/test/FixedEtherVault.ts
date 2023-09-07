import { Signer } from 'ethers';
import { ethers } from 'hardhat';
import { FixedEtherVault } from '../typechain-types';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

describe('FixedEtherVault', () => {
  const deployFixedEtherVault = async () => {
    const Signer = await ethers.getSigners();
    const FixedEtherVaultFactory =
      await ethers.getContractFactory('FixedEtherVault');
    const FixedEtherVault = await FixedEtherVaultFactory.deploy();
    return { Signer, FixedEtherVault };
  };
  let signer: Signer[];
  let fixedEtherVault: FixedEtherVault;
  before(async () => {
    const { Signer, FixedEtherVault } = await loadFixture(
      deployFixedEtherVault,
    );
    signer = Signer;
    fixedEtherVault = FixedEtherVault;
  });

  describe('입금', () => {
    it('사용자는 입금 할 수 있다.', async () => {
      const depositAmount = ethers.parseEther('10.0');
      const user = signer[1];
      await fixedEtherVault.connect(user).deposit({ value: depositAmount });
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
      expect(await fixedEtherVault.getEtherBalance()).to.be.equal(
        depositAmount,
      );
    });
    it('입금하지 않은 사용자의 잔액은 0이다.', async () => {
      expect(await fixedEtherVault.getUserBalance(signer[2])).to.be.equal(0);
    });
  });
  describe('출금', () => {
    it('사용자는 자신이 입금한 돈을 모두 출금할 수 있다.', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );
      fixedEtherVault = FixedEtherVault;
      signer = Signer;

      const depositAmount = ethers.parseEther('10.0');
      const user = signer[1];
      // 입금
      await fixedEtherVault.connect(user).deposit({ value: depositAmount });
      // 확인
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
      expect(await fixedEtherVault.getEtherBalance()).to.be.equal(
        depositAmount,
      );
      // 출금
      await fixedEtherVault.connect(user).withdraw(depositAmount);
      // 확인
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(0);
    });
    it('사용자는 자신이 입금한 돈의 일부분을 출금할 수 있다.', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );

      fixedEtherVault = FixedEtherVault;
      signer = Signer;
      const depositAmount = ethers.parseEther('10.0');
      const user = signer[1];
      // 입금
      await fixedEtherVault.connect(user).deposit({ value: depositAmount });
      // 확인
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
      const sevenETH = ethers.parseEther('7.0');
      const threeETH = ethers.parseEther('3.0');

      await fixedEtherVault.connect(user).withdraw(sevenETH);
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(threeETH);
    });
    it('사용자가 출금하려는 금액이 입금된 금액보다 클 경우 출금할 수 없다.', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );

      fixedEtherVault = FixedEtherVault;
      signer = Signer;
      const depositAmount = ethers.parseEther('10.0');
      const user = signer[1];
      await fixedEtherVault.connect(user).deposit({ value: depositAmount });
      expect(await fixedEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
      await expect(
        fixedEtherVault.connect(user).withdraw(ethers.parseEther('125.0')),
      ).to.be.revertedWith('SafeMath: subtraction overflow');
    });
    it('', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );

      fixedEtherVault = FixedEtherVault;
      signer = Signer;

      const MockFactory = await ethers.getContractFactory('MockSafeMath');
      const MockContract = await MockFactory.deploy();

      await expect(
        MockContract.mockAdd(ethers.MaxUint256, 1),
      ).to.be.revertedWith('SafeMath: addition overflow');
    });
  });
});
