import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { Signer } from 'ethers';
import { InsecureEtherVault } from '../typechain-types';
import { expect } from 'chai';
describe('InsecureEtherVault', () => {
  const deployInsecureEtherVault = async () => {
    const InsecureEtherVaultFactory =
      await ethers.getContractFactory('InsecureEtherVault');
    const InsecureEtherVault = await InsecureEtherVaultFactory.deploy();

    const Signers = await ethers.getSigners();
    return { Signers, InsecureEtherVault };
  };

  let signers: Signer[];
  let insecureEtherVault: InsecureEtherVault;
  before(async () => {
    const { Signers, InsecureEtherVault } = await loadFixture(
      deployInsecureEtherVault,
    );

    signers = Signers;
    insecureEtherVault = InsecureEtherVault;
  });

  describe('입금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100.0');
    it('사용자는 입금할 수 있다.', async () => {
      user = signers[1];

      await insecureEtherVault.connect(user).deposit({ value: depositAmount });
      expect(await insecureEtherVault.getBalance()).to.be.equal(depositAmount);
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
    });
  });
  describe('출금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100.0');

    it('사용자는 입금한 금액 전부를 한번에 출금할 수 있다.', async () => {
      const { Signers, InsecureEtherVault } = await loadFixture(
        deployInsecureEtherVault,
      );
      user = Signers[1];
      insecureEtherVault = InsecureEtherVault;

      // 입금
      await insecureEtherVault.connect(user).deposit({ value: depositAmount });
      // 잔액 확인
      expect(await insecureEtherVault.getBalance()).to.be.equal(depositAmount);
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(
        depositAmount,
      );
      // 출금
      await insecureEtherVault.connect(user).withdrawAll();
      // 잔액 확인
      expect(await insecureEtherVault.getBalance()).to.be.equal(
        ethers.parseEther('0'),
      );
      expect(await insecureEtherVault.getUserBalance(user)).to.be.equal(
        ethers.parseEther('0'),
      );
    });
    it('사용자가 입금한 잔액이 없으면 출금할 수 없다.', async () => {
      // 입금한적 없는 사용자
      user = signers[2];
      await expect(
        insecureEtherVault.connect(user).withdrawAll(),
      ).to.be.revertedWith('Insufficient balance');
    });
    it('출금 함수 호출 시 EOA, CA가 수신하지 못할 경우 Revert된다.', async () => {
      const deployMockContract = async () => {
        const MockContractFactory =
          await ethers.getContractFactory('MockContract');
        const MockContract =
          await MockContractFactory.deploy(insecureEtherVault);
        return { MockContract };
      };
      const { MockContract } = await loadFixture(deployMockContract);

      user = signers[1];
      // user의 주소로 1ETH 입금
      await insecureEtherVault
        .connect(user)
        .deposit({ value: ethers.parseEther('1') });
      const mockContractAddress = await MockContract.getAddress();
      // user가 Mock 컨트랙트의 주소로 1 ETH를 보내나다.
      await insecureEtherVault
        .connect(user)
        .transfer(mockContractAddress, ethers.parseEther('1'));
      // Mock가 1 ETH를 받았는지 확인
      expect(
        await insecureEtherVault.getUserBalance(mockContractAddress),
      ).to.be.equal(ethers.parseEther('1'));
      //
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
      const { InsecureEtherVault } = await loadFixture(
        deployInsecureEtherVault,
      );

      buyer = signers[1];
      seller = signers[2];
      await InsecureEtherVault.connect(buyer).deposit({
        value: depositAmount,
      });
      expect(await InsecureEtherVault.getBalance()).to.be.equal(depositAmount);
      await InsecureEtherVault.connect(buyer).transfer(seller, depositAmount);
      expect(await InsecureEtherVault.getUserBalance(seller)).to.be.equal(
        depositAmount,
      );
    });
    it('잔액이 충분하지 않은 유저는 다른 유저에게 이체할 수 없다.', async () => {
      const { InsecureEtherVault } = await loadFixture(
        deployInsecureEtherVault,
      );
      buyer = signers[1];
      seller = signers[2];

      await InsecureEtherVault.connect(buyer).transfer(seller, depositAmount);
      expect(await InsecureEtherVault.getUserBalance(seller)).to.be.equal(
        ethers.parseEther('0'),
      );
    });
  });
});
