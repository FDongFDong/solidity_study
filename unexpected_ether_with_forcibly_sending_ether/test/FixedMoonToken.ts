import { ethers } from 'hardhat';
import { FixedMoonToken } from '../typechain-types';
import { ContractTransactionResponse } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

describe('FixedMoonToken', () => {
  const DeployContract = async () => {
    const FixedMoonTokenFactory = await ethers.getContractFactory(
      'FixedMoonToken'
    );
    const FixedMoonToken = await FixedMoonTokenFactory.deploy();
    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    return { FixedMoonToken, Signers, deployer };
  };

  describe('Constructor', () => {
    let fixedMoonToken: FixedMoonToken & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    before(async () => {
      const { FixedMoonToken } = await loadFixture(DeployContract);
      fixedMoonToken = FixedMoonToken;
    });
    it('설정된 Token price를 확인할 수 있다', async () => {
      expect(await fixedMoonToken.TOKEN_PRICE()).to.equal(
        ethers.parseEther('1.0')
      );
    });
    it('설정된 name을 확인할 수 있다.', async () => {
      expect(await fixedMoonToken.name()).to.equal('Moon Token');
    });
    it('설정된 symbol을 확인할 수 있다.', async () => {
      expect(await fixedMoonToken.symbol()).to.equal('MOON');
    });
    it('설정된 decimals 값을 확인할 수 있다.', async () => {
      expect(await fixedMoonToken.decimals()).to.equal(0);
    });
  });
  describe('Buy', () => {
    it('Token을 구매할 수 있다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      // 구매자가 구매할 수 있도록 Ether를 전송한다.
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;

      await FixedMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(
        await FixedMoonToken.getUserBalance(await buyer.getAddress())
      ).to.be.equal(buyAmount);
    });
    it('사용자가 Token 구매 시 TotalSupply가 증가한다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;

      await FixedMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      expect(await FixedMoonToken.totalSupply()).to.equal(buyAmount);
    });
    it('사용자가 구매하려는 Token의 수량과 Ether의 수량이 일치하지 않으면 구매할 수 없다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 2;

      await expect(
        FixedMoonToken.connect(buyer).buy(buyAmount, {
          value: buyETHAmount,
        })
      ).to.be.revertedWith('Ether submitted and Token amount to buy mismatch');
    });
  });
  describe('Sell', () => {
    it('사용자가 Token 판매 시 TokenSupply가 감소한다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      const sellAmount = 1;

      await FixedMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      await FixedMoonToken.connect(buyer).sell(sellAmount);
      expect(await FixedMoonToken.totalSupply()).to.equal(0);
    });
    it('사용자가 판매하려는 Token의 수량이 보유한 수량보다 많으면 판매할 수 없다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      const sellAmount = 2;

      await FixedMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      await expect(FixedMoonToken.connect(buyer).sell(sellAmount)).to.be
        .reverted;
    });
  });
  describe('Transfer', () => {
    it('사용자가 Token을 전송할 수 있다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      const [buyer, seller] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      const transferAmount = 1;

      await FixedMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      await FixedMoonToken.connect(buyer).transfer(
        await seller.getAddress(),
        transferAmount
      );
      expect(
        await FixedMoonToken.getUserBalance(await seller.getAddress())
      ).to.be.equal(transferAmount);
    });
    it('Token을 전송받는 사용자의 주소가 0이면 전송할 수 없다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      const [buyer] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      const transferAmount = 1;

      await FixedMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      await expect(
        FixedMoonToken.connect(buyer).transfer(
          ethers.ZeroAddress,
          transferAmount
        )
      ).to.be.revertedWith('_to address is not valid');
    });
    it('전송하려는 Token의 수량이 보유한 수량보다 많으면 전송할 수 없다.', async () => {
      const { FixedMoonToken, Signers } = await loadFixture(DeployContract);
      const [buyer, seller] = Signers;
      const buyETHAmount = ethers.parseEther('1');
      const buyAmount = 1;
      const transferAmount = 2;

      await FixedMoonToken.connect(buyer).buy(buyAmount, {
        value: buyETHAmount,
      });
      await expect(
        FixedMoonToken.connect(buyer).transfer(
          await seller.getAddress(),
          transferAmount
        )
      ).to.be.revertedWith('Insufficient balance');
    });
  });
});
