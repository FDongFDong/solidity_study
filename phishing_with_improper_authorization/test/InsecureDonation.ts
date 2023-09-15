import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
describe('InsecureDonation', () => {
  const DeployContract = async () => {
    const InsecureDonationFactory = await ethers.getContractFactory(
      'InsecureDonation'
    );
    const InsecureDonation = await InsecureDonationFactory.deploy();
    const [owner] = await ethers.getSigners();
    const Signers = await ethers.getSigners();
    return { owner, Signers, InsecureDonation };
  };

  describe('Constructor', () => {
    it('Contract의 Owner의 주소를 확인할 수 있다.', async () => {
      const { owner, InsecureDonation } = await loadFixture(DeployContract);

      expect(await InsecureDonation.owner()).to.be.equal(
        await owner.getAddress()
      );
    });
  });

  describe('Transaction', () => {
    it('Contract가 가지고 있는 ETH의 양을 확인할 수 있다.', async () => {
      const { InsecureDonation } = await loadFixture(DeployContract);

      expect(await InsecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
    it('Contract에 ETH를 기부할 수 있다.', async () => {
      const { InsecureDonation, Signers } = await loadFixture(DeployContract);
      const user = Signers[3];
      await InsecureDonation.connect(user).buyMeACoffee({
        value: ethers.parseEther('10'),
      });
      expect(await InsecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });

    it('Owner는 ETH를 수집할 수 있다. ', async () => {
      const { InsecureDonation, owner, Signers } = await loadFixture(
        DeployContract
      );

      const user = Signers[3];
      // 처음 컨트랙트의 잔고는 0이어야 한다.
      expect(await InsecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('0')
      );
      // user가 10 이더를 입금한다.
      await InsecureDonation.connect(user).buyMeACoffee({
        value: ethers.parseEther('10'),
      });
      // 10 이더가 실제로 입금되었는지 확인한다.
      expect(await InsecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );
      // 10이더를 출금한다.
      await InsecureDonation.connect(owner).collectEthers(
        user,
        ethers.parseEther('10')
      );
      // 남은 잔액이 0이더인지 확인한다.
      expect(await InsecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
    it('Owner가 아니면 ETH를 수집할 수 없다.', async () => {
      const { Signers, InsecureDonation, owner } = await loadFixture(
        DeployContract
      );
      const user = Signers[3];
      const nonOwner = Signers[4];
      // 사용자가 Contract에 10개의 ETH를 기부한다.
      expect(
        await InsecureDonation.buyMeACoffee({ value: ethers.parseEther('10') })
      );

      // 실제 Contract에 10개의 ETH가 있는지 확인한다.
      expect(await InsecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );

      // Owner가 아닌 일반 사용자가 ETH를 출금하면 실패해야한다.
      await expect(
        InsecureDonation.connect(nonOwner).collectEthers(user, 10)
      ).to.be.revertedWith('Not owner');
    });
  });
  describe('Mock', () => {
    it('커버리지 채우기용', async () => {
      const MockFactory = await ethers.getContractFactory('Mock');
      const Mock = await MockFactory.deploy();
      const { InsecureDonation, owner } = await loadFixture(DeployContract);

      await InsecureDonation.buyMeACoffee({
        value: ethers.parseEther('0.000001'),
      });
      expect(await InsecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('0.000001')
      );

      await expect(
        InsecureDonation.connect(owner).collectEthers(
          await Mock.getAddress(),
          ethers.parseEther('1000')
        )
      ).to.be.revertedWith('Failed to send Ether');
    });
  });
});
