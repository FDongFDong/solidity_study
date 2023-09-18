import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { InsecureMoonToken } from '../typechain-types';
import { ContractTransactionResponse } from 'ethers';
import { expect } from 'chai';

describe('InsecureMoonToken', () => {
  const DeployContract = async () => {
    const InsecureMoonTokenFactory = await ethers.getContractFactory(
      'InsecureMoonToken'
    );
    const InsecureMoonToken = await InsecureMoonTokenFactory.deploy();
    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();

    return { deployer, Signers, InsecureMoonToken };
  };

  describe('Constructor', () => {
    let insecureMoonToken: InsecureMoonToken & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    before(async () => {
      const { InsecureMoonToken } = await loadFixture(DeployContract);
      insecureMoonToken = InsecureMoonToken;
    });
    it('설정된 Token price를 확인할 수 있다', async () => {
      expect(await insecureMoonToken.TOKEN_PRICE()).to.equal(
        ethers.parseEther('1.0')
      );
    });
    it('설정된 name을 확인할 수 있다.', async () => {
      expect(await insecureMoonToken.name()).to.equal('Moon Token');
    });
    it('설정된 symbol을 확인할 수 있다.', async () => {
      expect(await insecureMoonToken.symbol()).to.equal('MOON');
    });
    it('설정된 decimals 값을 확인할 수 있다.', async () => {
      expect(await insecureMoonToken.decimals()).to.equal(0);
    });
  });
  describe('Buy', () => {
    it('Token을 구매할 수 있다.', async () => {
      const { deployer, Signers, InsecureMoonToken } = await loadFixture(
        DeployContract
      );
      // 구매자가 구매할 수 있도록 Ether를 전송한다.
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;

      await InsecureMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(
        await InsecureMoonToken.getUserBalance(await buyer.getAddress())
      ).to.be.equal(buyAmount);
    });
    it('사용자가 Token 구매 시 TotalSupply가 증가한다.', async () => {
      const { deployer, Signers, InsecureMoonToken } = await loadFixture(
        DeployContract
      );
      // 구매자가 구매할 수 있도록 Ether를 전송한다.
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;

      await InsecureMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(await InsecureMoonToken.totalSupply()).to.be.equal(buyAmount);
    });
    it('사용자가 구매하려는 Token의 수량과 Ether의 수량이 일치하지 않으면 구매할 수 없다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);

      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 2;

      await expect(
        InsecureMoonToken.connect(buyer).buy(buyAmount, {
          value: buyETHAmount,
        })
      ).to.be.revertedWith('Ether submitted and Token amount to buy mismatch');
    });
  });
  describe('Sell', () => {
    it('사용자가 Token 판매 시 TotalSupply가 감소한다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;

      await InsecureMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(await InsecureMoonToken.totalSupply()).to.be.equal(buyAmount);

      await InsecureMoonToken.connect(buyer).sell(buyAmount);
      expect(await InsecureMoonToken.totalSupply()).to.be.equal(0);
    });
    it('사용자가 판매하려는 Token의 수량이 보유한 수량보다 많으면 판매할 수 없다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      await InsecureMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(
        await InsecureMoonToken.getUserBalance(await buyer.getAddress())
      ).to.be.equal(buyAmount);
      expect(await InsecureMoonToken.totalSupply()).to.be.equal(buyAmount);

      await expect(InsecureMoonToken.connect(buyer).sell(2)).to.be.revertedWith(
        'Insufficient balance'
      );
    });
  });
  describe('Transfer', () => {
    it('사용자가 Token을 전송할 수 있다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const [buyer, seller] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      await InsecureMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(
        await InsecureMoonToken.getUserBalance(await buyer.getAddress())
      ).to.be.equal(buyAmount);
      expect(await InsecureMoonToken.totalSupply()).to.be.equal(buyAmount);

      await InsecureMoonToken.connect(buyer).transfer(
        await seller.getAddress(),
        buyAmount
      );
      expect(
        await InsecureMoonToken.getUserBalance(await buyer.getAddress())
      ).to.be.equal(0);
      expect(
        await InsecureMoonToken.getUserBalance(await seller.getAddress())
      ).to.be.equal(buyAmount);
    });
    it('Token을 전송받는 사용자의 주소가 0이면 전송할 수 없다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      await InsecureMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(
        await InsecureMoonToken.getUserBalance(await buyer.getAddress())
      ).to.be.equal(buyAmount);
      expect(await InsecureMoonToken.totalSupply()).to.be.equal(buyAmount);
      // 전송받는 사용자의 주소가 0이면 전송할 수 없다.
      await expect(
        InsecureMoonToken.connect(buyer).transfer(ethers.ZeroAddress, 1)
      ).to.be.revertedWith('_to address is not valid');
    });
    it('전송하려는 Token의 수량이 보유한 수량보다 많으면 전송할 수 없다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const [buyer, seller] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      await InsecureMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(
        await InsecureMoonToken.getUserBalance(await buyer.getAddress())
      ).to.be.equal(buyAmount);
      expect(await InsecureMoonToken.totalSupply()).to.be.equal(buyAmount);

      await expect(
        InsecureMoonToken.connect(buyer).transfer(await seller.getAddress(), 2)
      ).to.be.revertedWith('Insufficient balance');
    });
  });
});
