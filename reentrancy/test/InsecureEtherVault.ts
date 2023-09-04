import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { ethers } from 'hardhat';

import {
  InsecureEtherVault,
  InsecureEtherVault__factory,
} from '../typechain-types';
import { Contract, Signer } from 'ethers';
import { expect } from 'chai';

describe('InsecureEtherVault', () => {
  const deployInsecureEtherVault = async () => {
    const Signer = await ethers.getSigners();
    const InsecureEtherVaultContract = await ethers.getContractFactory(
      'InsecureEtherVault'
    );
    const InsecureEtherVault = await InsecureEtherVaultContract.deploy();
    return { InsecureEtherVault, Signer };
  };
  let insecureEtherVault: InsecureEtherVault;
  let signer: Signer[];
  before(async () => {
    const { InsecureEtherVault, Signer } = await loadFixture(
      deployInsecureEtherVault
    );
    insecureEtherVault = InsecureEtherVault;
    signer = Signer;
  });

  describe('입금 테스트', () => {
    const depositAmount = ethers.parseEther('1.0');
    it('사용자의 이더를 입금받을 수 있어야 한다.', async () => {
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;
      const user = await signer[1].getAddress();
      await insecureEtherVault.connect(signer[1]).deposit({
        value: depositAmount,
      });
      const finalBalance = await insecureEtherVault.getUserBalance(user);
      expect(finalBalance).to.equal(depositAmount);
    });
    it('사용자가 이더를 입금하면 컨트랙트의 총 잔액이 업데이트 된다.', async () => {
      const totalAmount = await insecureEtherVault.getBalance();
      expect(totalAmount).to.equal(depositAmount);
    });
  });

  describe('출금 테스트', () => {
    const depositAmount = ethers.parseEther('1.0');
    it('사용자가 자신이 입금한 이더를 모두 출금 할 수 있다.', async () => {
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;
      const user = await signer[1].getAddress();
      const userInitBalance = await ethers.provider.getBalance(user);
      const totalAmount = await insecureEtherVault.getBalance();
      expect(totalAmount).to.equal(ethers.parseEther('0'));
      // 1이더 입금
      const tx = await insecureEtherVault.connect(signer[1]).deposit({
        value: depositAmount,
      });
      // tx 영수증
      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed;

      if (gasUsed) {
        const result = depositAmount + gasUsed * tx.gasPrice;
        // 1이더 입금 후 유저의 잔고
        const userBalance2 = await ethers.provider.getBalance(user);
        expect(userBalance2).to.equal(userInitBalance - result);
      }

      await insecureEtherVault.connect(signer[1]).withdrawAll();
      expect(await insecureEtherVault.getBalance()).to.equal(
        ethers.parseEther('0')
      );
    });
    it('사용자가 모든 이더를 출금하면 총 잔액이 0이 된다.', async () => {
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;

      const totalAmount = await insecureEtherVault.getBalance();
      expect(totalAmount).to.equal(ethers.parseEther('0'));
      // 1이더 입금
      await insecureEtherVault.connect(signer[1]).deposit({
        value: depositAmount,
      });
      // 1이더 출금
      await insecureEtherVault.connect(signer[1]).withdrawAll();
      expect(await insecureEtherVault.getBalance()).to.equal(
        ethers.parseEther('0')
      );
    });

    it('컨트랙트에 입금되어 있는 잔고가 없으면 실패한다.', async () => {
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;

      await expect(
        insecureEtherVault.connect(signer[1]).withdrawAll()
      ).to.be.revertedWith('Insufficient balance');
    });

    it('호출한 주소에서 이더를 수신하는데 실패하면 revert된다.', async () => {
      const FailingReceiver = await ethers.getContractFactory(
        'FailingReceiver'
      );
      const { InsecureEtherVault, Signer } = await loadFixture(
        deployInsecureEtherVault
      );
      insecureEtherVault = InsecureEtherVault;
      signer = Signer;

      const insecureEtherVaultAddress = await insecureEtherVault.getAddress();

      let failingReceiver = await FailingReceiver.deploy(
        insecureEtherVaultAddress
      );

      await expect(
        failingReceiver.connect(signer[1]).depositAndWithdraw({
          value: ethers.parseEther('0.5'),
        })
      ).to.be.rejectedWith('Failed to send Ether');
    });
  });
});
