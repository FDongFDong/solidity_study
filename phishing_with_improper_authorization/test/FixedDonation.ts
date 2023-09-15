import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('FixedDonation', () => {
  const DeployContract = async () => {
    const FixedDonationFactory = await ethers.getContractFactory(
      'FixedDonation'
    );
    const FixedDonation = await FixedDonationFactory.deploy();

    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    return { FixedDonation, Signers, deployer };
  };
  describe('Constructor', () => {
    it('Contract의 Owner의 주소를 확인할 수 있다.', async () => {
      const { FixedDonation, deployer } = await loadFixture(DeployContract);
      expect(await FixedDonation.owner()).to.be.equal(
        await deployer.getAddress()
      );
    });
  });
  describe('Transaction', () => {
    it('Contract가 가지고 있는 ETH의 양을 확인할 수 있다', async () => {
      const { FixedDonation } = await loadFixture(DeployContract);

      expect(await FixedDonation.getBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
    it('Contract에 ETH를 기부할 수 있다.', async () => {
      const { FixedDonation, Signers } = await loadFixture(DeployContract);

      await FixedDonation.buyMeACoffee({ value: ethers.parseEther('10') });
      expect(await FixedDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('Owner는 ETH를 수집할 수 있다.', async () => {
      const { FixedDonation, deployer } = await loadFixture(DeployContract);

      await FixedDonation.buyMeACoffee({ value: ethers.parseEther('10') });
      expect(await FixedDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );

      await FixedDonation.connect(deployer).collectEthers(
        deployer,
        ethers.parseEther('10')
      );
      expect(await FixedDonation.getBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
    it('Owner가 아니면 ETH를 수집할 수 없다.', async () => {
      const { Signers, FixedDonation } = await loadFixture(DeployContract);
      const user = Signers[3];
      await FixedDonation.buyMeACoffee({ value: ethers.parseEther('10') });
      expect(await FixedDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );
      await expect(
        FixedDonation.connect(user).collectEthers(
          await user.getAddress(),
          ethers.parseEther('10')
        )
      ).to.be.revertedWith('Not owner');
    });
  });
  describe('Mock', () => {
    it('커버리지 채우기용', async () => {
      const MockFactory = await ethers.getContractFactory('Mock');
      const Mock = await MockFactory.deploy();

      const { FixedDonation, deployer } = await loadFixture(DeployContract);

      await FixedDonation.buyMeACoffee({ value: ethers.parseEther('10') });
      await expect(
        FixedDonation.connect(deployer).collectEthers(
          await Mock.getAddress(),
          ethers.parseEther('100')
        )
      ).to.be.revertedWith('Failed to send Ether');
    });
  });
});
