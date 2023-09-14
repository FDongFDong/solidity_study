import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { FixedMoonToken } from '../typechain-types';

describe('FixedMoonToken', () => {
  const DeployContract = async () => {
    const FixedMoonTokenFactory = await ethers.getContractFactory(
      'FixedMoonToken'
    );
    const FixedMoonToken = await FixedMoonTokenFactory.deploy();
    const Signers = await ethers.getSigners();

    return { FixedMoonToken, Signers };
  };
  let signers: Signer[];
  let fixedMoonToken: FixedMoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
    fixedMoonToken = FixedMoonToken;
    signers = Signers;
  });

  describe('Constructor', () => {
    it('FixedMoonToken 배포 시 name을 확인할 수 있다.', async () => {
      expect(await fixedMoonToken.name()).to.be.equal('Moon Token');
    });
    it('FixedMoonToken 배포 시 symbol을 확인할 수 있다.', async () => {
      expect(await fixedMoonToken.symbol()).to.be.equal('MOON');
    });
    it('InsecureMoonToken 배포 시 TOKEN PRICE를 확인할 수 있다.', async () => {
      expect(await fixedMoonToken.TOKEN_PRICE()).to.be.equal(
        ethers.parseEther('1')
      );
    });
    it('InsecureMoonToken 배포 시 Decimal을 확인할 수 있다.', async () => {
      expect(await fixedMoonToken.decimals()).to.be.equal(0);
    });
    it('FixedMoonToken 배포 시 0 ETH를 가지고 있다.', async () => {
      expect(await fixedMoonToken.getEtherBalance()).to.be.equal(0);
    });
  });
  describe('buy', () => {
    it('사용자가 10 ETH를 가지고 10 Moon Token을 구입할 수 있다.', async () => {
      const { Signers, FixedMoonToken } = await loadFixture(DeployContract);
      const user = Signers[3];

      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(0);

      await FixedMoonToken.connect(user).buy(10, {
        value: ethers.parseEther('10'),
      });
      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(10);
      expect(await FixedMoonToken.getEtherBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('사용자가 Moon Token 구매시 구매하려는 Token의 양과 지출한 ETH의 양이 다르면 Revert된다', async () => {
      const { Signers, FixedMoonToken } = await loadFixture(DeployContract);
      const user = Signers[4];

      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(0);
      await expect(
        FixedMoonToken.connect(user).buy(7, { value: ethers.parseEther('3') })
      ).to.be.revertedWith('Ether received and Token amount to buy mismatch');
    });
  });
  describe('sell', () => {
    let user: Signer;
    it('사용자는 자신이 가지고 있는 Moon Token을 일정량 판매할 수 있다.', async () => {
      const { Signers, FixedMoonToken } = await loadFixture(DeployContract);
      user = Signers[3];
      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(0);
      await FixedMoonToken.connect(user).buy(10, {
        value: ethers.parseEther('10'),
      });
      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(10);
      expect(await FixedMoonToken.getEtherBalance()).to.be.equal(
        ethers.parseEther('10')
      );
      await FixedMoonToken.connect(user).sell(3);
      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(7);
      expect(await FixedMoonToken.getEtherBalance()).to.be.equal(
        ethers.parseEther('7')
      );
    });
    it('사용자는 자신이 가지고 있는 Moon Token 전체를 판매할 수 있다.', async () => {
      const { Signers, FixedMoonToken } = await loadFixture(DeployContract);
      user = Signers[3];

      await FixedMoonToken.connect(user).buy(10, {
        value: ethers.parseEther('10'),
      });
      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(10);

      await FixedMoonToken.connect(user).sell(10);
      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(0);
    });
    it('사용자가 소유한 Token보다 많은 Token을 판매하려고 하면 revert된다.', async () => {
      const { Signers, FixedMoonToken } = await loadFixture(DeployContract);
      user = Signers[3];

      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(0);

      await FixedMoonToken.connect(user).buy(10, {
        value: ethers.parseEther('10'),
      });
      expect(await FixedMoonToken.getUserBalance(user)).to.be.equal(10);

      await expect(FixedMoonToken.connect(user).sell(20)).to.be.revertedWith(
        'Insufficient balance'
      );
    });
  });
});
