import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { InsecureEtherVault } from '../typechain-types';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

describe('InsecureEtherVault', () => {
  const deployInsecureEtherVault = async () => {
    const Signer = await ethers.getSigners();
    const InsecureEtherVaultFactory =
      await ethers.getContractFactory('InsecureEtherVault');
    const InsecureEtherVault = await InsecureEtherVaultFactory.deploy();
    return { InsecureEtherVault, Signer };
  };
  let insecureEtherVault: InsecureEtherVault;
  let signer: Signer[];

  before(async () => {
    const { InsecureEtherVault, Signer } = await loadFixture(
      deployInsecureEtherVault,
    );
    insecureEtherVault = InsecureEtherVault;
    signer = Signer;
  });

  describe('입금', () => {
    const depositAmount = ethers.parseEther('100.0');

    it('사용자는 입금 할 수 있다.', async () => {
      const user = signer[1];
      await insecureEtherVault.connect(user).deposit({ value: depositAmount });
      expect(await insecureEtherVault.getEtherBalance()).to.be.equal(
        depositAmount,
      );
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
    });
    it('입금하지 않은 사용자의 잔액은 0이다.', async () => {
      expect(await insecureEtherVault.getUserBalance(signer[2])).to.be.equal(0);
    });
  });

  describe('', () => {
    const depositAmount = ethers.parseEther('10.0');
    it('사용자는 자신이 입금한 돈을 모두 출금할 수 있다.', async () => {
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault,
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;

      const user = signer[1];
      // 입금
      await insecureEtherVault.connect(user).deposit({ value: depositAmount });
      // 확인
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
      // 출금
      await insecureEtherVault.connect(user).withdraw(depositAmount);
      // 확인
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(0);
    });

    it('사용자는 자신이 입금한 돈의 일부분만을 출금할 수 있다.', async () => {
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault,
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;
      const user = signer[1];
      // 입금
      await insecureEtherVault.connect(user).deposit({ value: depositAmount });
      // 확인
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
      // 일부분 출금
      const sevenETH = ethers.parseEther('7.0');
      const threeETH = ethers.parseEther('3.0');
      await insecureEtherVault.connect(user).withdraw(sevenETH);
      // 일부분을 뺀 남은 금액이 들어있는지 확인
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(
        threeETH,
      );
    });

    it('사용자가 출금하려는 금액이 입금된 금액보다 클 경우 출금할 수 없다.', async () => {
      const depositAmount = ethers.parseEther('10.0');
      const user = signer[1];
      await insecureEtherVault.connect(user).deposit({ value: depositAmount });

      await expect(
        insecureEtherVault.connect(user).withdraw(ethers.parseEther('125.0')),
      ).to.be.revertedWith('Insufficient balance');
    });

    it('출금 함수호출 시 출금함수를 호출한 CA, EOA가 수신하지 못할 경우 revert한다', async () => {
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault,
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;
      await expect(
        insecureEtherVault.withdraw(ethers.parseEther('5.0')),
      ).to.be.revertedWith('Failed to send Ether');
    });
  });
});
