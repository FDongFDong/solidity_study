import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { FixedWinnerTakesItAll } from '../typechain-types';
import { ContractTransactionResponse, Signer } from 'ethers';
import { expect } from 'chai';

describe('FixedWinnerTakesItAll', () => {
  const challengePeriod = 3000;
  const DeployContract = async () => {
    const [Owner, FirstUser, SecondUser] = await ethers.getSigners();
    const FixedWinnerTakesItAllFactory = await ethers.getContractFactory(
      'FixedWinnerTakesItAll'
    );
    const FixedWinnerTakesItAll = await FixedWinnerTakesItAllFactory.deploy(
      challengePeriod,
      { value: ethers.parseEther('10') }
    );
    return { Owner, FirstUser, SecondUser, FixedWinnerTakesItAll };
  };

  describe('constructor', () => {
    let fixedWinnerTakesItAll: FixedWinnerTakesItAll & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let owner: Signer;

    before(async () => {
      const { FixedWinnerTakesItAll, Owner } = await loadFixture(
        DeployContract
      );
      owner = Owner;
      fixedWinnerTakesItAll = FixedWinnerTakesItAll;
    });

    it('초기 리더는 0x00의 주소로 되어 있다.', async () => {
      expect(await fixedWinnerTakesItAll.currentleader()).to.be.equal(
        ethers.ZeroAddress
      );
    });
    it('초기 lastDepositedAmount는 10 ETH이다.', async () => {
      expect(await fixedWinnerTakesItAll.lastDepositedAmount()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('초기 currentLeaderReward는 0이다.', async () => {
      expect(await fixedWinnerTakesItAll.currentLeaderReward()).to.be.equal(0);
    });
    it('초기 nextLeaderReward는 10 ETH이다.', async () => {
      expect(await fixedWinnerTakesItAll.nextLeaderReward()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('초기 Contract가 보유한 ETH는 10 ETH이다.', async () => {
      expect(await fixedWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });

    it('초기 rewardClaimed는 false이다.', async () => {
      expect(await fixedWinnerTakesItAll.rewardClaimed()).to.be.false;
    });
    it('초기 challengePeriod는 배포시 입력한 시간 + blockTimestamp이다.', async () => {
      const blockTimestamp = await ethers.provider.getBlock('latest');
      expect(await fixedWinnerTakesItAll.challengeEnd()).to.be.equal(
        blockTimestamp && blockTimestamp.timestamp + challengePeriod
      );
    });

    it('Contract 배포 시 챌린지가 시작된다.', async () => {
      expect(await fixedWinnerTakesItAll.isChallengeEnd()).to.be.false;
    });
    it('Contract 배포 시 10 ETH를 입금하지 않으면 배포할 수 없다.', async () => {
      const tempFixedWinnerTakesItAllFactory = await ethers.getContractFactory(
        'FixedWinnerTakesItAll'
      );
      await expect(
        tempFixedWinnerTakesItAllFactory.deploy(challengePeriod)
      ).to.be.revertedWith('Require an initial 10 Ethers reward');
    });
  });
  describe('claimLeader', () => {
    let owner: Signer;
    let fixedWinnerTakesItAll: FixedWinnerTakesItAll & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    before(async () => {
      const { Owner, FixedWinnerTakesItAll } = await loadFixture(
        DeployContract
      );
      fixedWinnerTakesItAll = FixedWinnerTakesItAll;
      owner = Owner;
    });

    it('block.timestamp가 challengeEnd보다 작으면 revert한다. ', async () => {
      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mind');

      await expect(fixedWinnerTakesItAll.claimLeader()).to.be.revertedWith(
        'Challenge is finished'
      );
      ethers.provider.send('evm_increaseTime', [-40000]);
      ethers.provider.send('evm_mind');
    });
    it('msg.sender == currentLeader이면 revert한다.', async () => {
      await fixedWinnerTakesItAll
        .connect(owner)
        .claimLeader({ value: ethers.parseEther('11') });
      await expect(
        fixedWinnerTakesItAll
          .connect(owner)
          .claimLeader({ value: ethers.parseEther('12') })
      ).to.revertedWith('You are the current leader');
    });
  });
});
