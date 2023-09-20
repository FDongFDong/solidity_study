import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { FixedWinnerTakesItAll } from '../typechain-types';
import { ContractTransactionResponse, Signer, Wallet } from 'ethers';
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
      ethers.provider.send('evm_mine');

      await expect(fixedWinnerTakesItAll.claimLeader()).to.be.revertedWith(
        'Challenge is finished'
      );
      ethers.provider.send('evm_increaseTime', [-40000]);
      ethers.provider.send('evm_mine');
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
    it('currentLeader의 Address가 0x00이면 claimLeader 실행 시 msg.sender가 currentLeader가 된다.', async () => {
      const { FixedWinnerTakesItAll, Owner, FirstUser } = await loadFixture(
        DeployContract
      );

      await FixedWinnerTakesItAll.connect(FirstUser).claimLeader({
        value: ethers.parseEther('11'),
      });
      expect(await FixedWinnerTakesItAll.currentleader()).to.be.equal(
        await FirstUser.getAddress()
      );
    });
    it('챌린지에 참여하기 위해서는 lastDepositedAmount보다 ETH를 더 보내야한다.', async () => {
      const { FixedWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );
      await expect(
        FixedWinnerTakesItAll.connect(FirstUser).claimLeader({
          value: ethers.parseEther('9'),
        })
      ).to.be.revertedWith('You must pay more than the current leader');
    });

    it('currentLeader가 있으면 이전 Leader가 참여한 금액의 90%만 돌려준다.', async () => {
      const { FixedWinnerTakesItAll, FirstUser, SecondUser } =
        await loadFixture(DeployContract);
      expect(await FixedWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('10')
      );

      await FixedWinnerTakesItAll.connect(FirstUser).claimLeader({
        value: ethers.parseEther('100'),
      });

      expect(await FixedWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('110')
      );

      await FixedWinnerTakesItAll.connect(SecondUser).claimLeader({
        value: ethers.parseEther('200'),
      });

      // 이전 리더에게 돌려줄 금액을 계산
      const refundAmount =
        (ethers.parseEther('100') * ethers.parseEther('9')) /
        ethers.parseEther('10');

      // 이전 리더가 출금한다.
      await FixedWinnerTakesItAll.connect(FirstUser).claimRefund();
      await expect(
        FixedWinnerTakesItAll.connect(FirstUser).claimRefund()
      ).to.be.revertedWith('You have no refund');
      // 새로운 잔액을 계산
      const newBalance =
        ethers.parseEther('110') + ethers.parseEther('200') - refundAmount;

      expect(await FixedWinnerTakesItAll.getEtherBalance()).to.be.equal(
        newBalance
      );
    });
  });
  describe('claimPrincipalAndReward', () => {
    it('챌린지가 끝나지 않았으면 revert 한다.', async () => {
      const { FixedWinnerTakesItAll } = await loadFixture(DeployContract);
      await expect(
        FixedWinnerTakesItAll.claimPrincipalAndReward()
      ).to.be.revertedWith('Challenge is not finished yet');
    });
    it('상금을 받으려는 Address가 currentLeader가 아니면 revert 한다.', async () => {
      const { FixedWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );
      const randomWallet = Wallet.createRandom(ethers.provider);
      await FirstUser.sendTransaction({
        to: randomWallet.address,
        value: ethers.parseEther('200'),
      });

      expect(
        await ethers.provider.getBalance(randomWallet.address)
      ).to.be.equal(ethers.parseEther('200'));

      await FixedWinnerTakesItAll.connect(FirstUser).claimLeader({
        value: ethers.parseEther('200'),
      });

      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mine');

      await expect(
        FixedWinnerTakesItAll.connect(randomWallet).claimPrincipalAndReward()
      ).to.be.revertedWith('You are not the winner');
    });
    it('챌린지가 끝나면 리더는 리더보상 + 리더가 보유한 금액을 받는다.', async () => {
      const { FixedWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );

      const randomWallet = Wallet.createRandom().connect(ethers.provider);
      await FirstUser.sendTransaction({
        to: randomWallet.address,
        value: ethers.parseEther('200'),
      });

      await FixedWinnerTakesItAll.connect(randomWallet).claimLeader({
        value: ethers.parseEther('100'),
      });

      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mine');

      await FixedWinnerTakesItAll.connect(
        randomWallet
      ).claimPrincipalAndReward();

      expect(await FixedWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
  });
});
