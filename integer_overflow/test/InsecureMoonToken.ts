import { ContractTransactionResponse, Signer, isError } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { InsecureMoonToken } from '../typechain-types';
import { expect } from 'chai';

describe('InsecureMoonToken', () => {
  const DeployContract = async () => {
    const InsecureMoonTokenFactory = await ethers.getContractFactory(
      'InsecureMoonToken'
    );
    const InsecureMoonToken = await InsecureMoonTokenFactory.deploy();

    const Signers = await ethers.getSigners();

    return { InsecureMoonToken, Signers };
  };

  let signers: Signer[];
  let insecureMoonToken: InsecureMoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
    insecureMoonToken = InsecureMoonToken;
    signers = Signers;
  });

  describe('Constructor', () => {
    let user: Signer;
    it('InsecureMoonToken 배포 시 name을 확인할 수 있다.', async () => {
      expect(await insecureMoonToken.name()).to.be.equal('Moon Token');
    });
    it('InsecureMoonToken 배포 시 symbol을 확인할 수 있다.', async () => {
      expect(await insecureMoonToken.symbol()).to.be.equal('MOON');
    });
    it('InsecureMoonToken 배포 시 TOKEN PRICE를 확인할 수 있다.', async () => {
      expect(await insecureMoonToken.TOKEN_PRICE()).to.be.equal(
        ethers.parseEther('1')
      );
    });
    it('InsecureMoonToken 배포 시 Decimal을 확인할 수 있다.', async () => {
      expect(await insecureMoonToken.decimals()).to.be.equal(0);
    });
    it('InsecureMoonToken 배포 시 0 ETH를 가지고 있다.', async () => {
      expect(await insecureMoonToken.getEtherBalance()).to.be.equal(0);
    });
  });
  describe('buy', () => {
    it('사용자가 10 ETH를 가지고 10 Moon Token을 구입할 수 있다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const user = Signers[3];
      // 사용자가 InsecureMoonToken 컨트랙트에 가지고 있는 초기 토큰의 개수는 0이다
      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(0);

      // 10개의 ETH를 주고 10개의 Token을 받는다.
      await InsecureMoonToken.connect(user).buy(10, {
        value: ethers.parseEther('10'),
      });
      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(10);
      expect(await InsecureMoonToken.getEtherBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('사용자가 Moon Token 구매시 구매하려는 Token의 양과 지출한 ETH의 양이 다르면 Revert된다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const user = Signers[4];

      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(0);
      await expect(
        InsecureMoonToken.connect(user).buy(7, {
          value: ethers.parseEther('10'),
        })
      ).to.be.revertedWith('Ether received and Token amount to buy mismatch');
    });
  });
  describe('sell', () => {
    it('사용자는 자신이 가지고 있는 Moon Token을 일정량 판매할 수 있다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const user = Signers[3];
      const INITIAL_BALANCE = 0;
      const BUY_AMOUNT = 10;
      const SELL_AMOUNT = 3;
      const BUY_ETH_VALUE = ethers.parseEther('10');
      const EXPECTED_BALANCE_AFTER_BUY = 10;
      const EXPECTED_BALANCE_AFTER_SELL = 7;

      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(
        INITIAL_BALANCE
      );
      await InsecureMoonToken.connect(user).buy(BUY_AMOUNT, {
        value: BUY_ETH_VALUE,
      });
      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(
        EXPECTED_BALANCE_AFTER_BUY
      );

      await InsecureMoonToken.connect(user).sell(SELL_AMOUNT);
      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(
        EXPECTED_BALANCE_AFTER_SELL
      );
    });
    it('사용자는 자신이 가지고 있는 Moon Token 전체를 판매할 수 있다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const user = Signers[3];

      await InsecureMoonToken.connect(user).buy(10, {
        value: ethers.parseEther('10'),
      });
      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(10);

      await InsecureMoonToken.connect(user).sell(10);
      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(0);
    });
    it('사용자가 소유한 Token보다 많은 Token을 판매하려고 하면 revert된다.', async () => {
      const { Signers, InsecureMoonToken } = await loadFixture(DeployContract);
      const user = Signers[3];

      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(0);

      await InsecureMoonToken.connect(user).buy(10, {
        value: ethers.parseEther('10'),
      });
      expect(await InsecureMoonToken.getUserBalance(user)).to.be.equal(10);

      await expect(InsecureMoonToken.connect(user).sell(20)).to.be.revertedWith(
        'Insufficient balance'
      );
    });
  });
});
