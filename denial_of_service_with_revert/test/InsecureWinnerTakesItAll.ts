import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { InsecureWinnerTakesItAll } from '../typechain-types';
import { Block, ContractTransactionResponse, Signer, Wallet } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('InsecureWinnerTakesItAll', () => {
  const challengePeriod = 3000;
  const DeployContract = async () => {
    const [Owner, FirstUser, SecondUser, ThirdUser] = await ethers.getSigners();

    const InsecureWinnerTakesItAllFactory = await ethers.getContractFactory(
      'InsecureWinnerTakesItAll'
    );

    const InsecureWinnerTakesItAll =
      await InsecureWinnerTakesItAllFactory.deploy(challengePeriod, {
        from: await Owner.getAddress(),
        value: ethers.parseEther('10'),
      });

    return {
      Owner,
      FirstUser,
      SecondUser,
      ThirdUser,
      InsecureWinnerTakesItAll,
    };
  };
  let insecureWinnerTakesItAll: InsecureWinnerTakesItAll & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let owner: HardhatEthersSigner;
  describe('constructor', () => {
    before(async () => {
      const { Owner, InsecureWinnerTakesItAll } = await loadFixture(
        DeployContract
      );
      insecureWinnerTakesItAll = InsecureWinnerTakesItAll;
      owner = Owner;
    });
    it('초기 리더는 0x00의 주소로 되어있다.', async () => {
      expect(await insecureWinnerTakesItAll.currentleader()).to.be.equal(
        ethers.ZeroAddress
      );
    });
    it('초기 lastDepositedAmount는 10 ETH이다.', async () => {
      expect(await insecureWinnerTakesItAll.lastDepositedAmount()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('초기 currentLeaderReward는 0 이다..', async () => {
      expect(await insecureWinnerTakesItAll.currentLeaderReward()).to.be.equal(
        0
      );
    });
    it('초기 nextLeaderReward는 10 ETH이다.', async () => {
      expect(await insecureWinnerTakesItAll.nextLeaderReward()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('초기 Contract가 보유한 ETH는 10 ETH이다.', async () => {
      expect(await insecureWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });

    it('초기 rewardClaimed는 false이다.', async () => {
      expect(await insecureWinnerTakesItAll.rewardClaimed()).to.be.equal(false);
    });
    it('초기 challengeEnd는 배포시 입력한 시간 + blockTimestamp이다.', async () => {
      const blockTimestamp = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      expect(await insecureWinnerTakesItAll.challengeEnd()).to.be.equal(
        blockTimestamp && blockTimestamp.timestamp + challengePeriod
      );
    });

    it('Contract 배포 시 챌린지가 시작된다.', async () => {
      expect(await insecureWinnerTakesItAll.isChallengeEnd()).to.be.false;
    });
    it('Contract 배포 시 10ETH를 입금하지 않으면 배포할 수 없다.', async () => {
      const tempInsecureWinnerTakesItAllFactory =
        await ethers.getContractFactory('InsecureWinnerTakesItAll');
      await expect(
        tempInsecureWinnerTakesItAllFactory.deploy(challengePeriod)
      ).to.be.revertedWith('Require an initial 10 Ethers reward');
    });
  });
  describe('claimLeader', () => {
    let firstUser: Signer;
    before(async () => {
      const { FirstUser, InsecureWinnerTakesItAll } = await loadFixture(
        DeployContract
      );
      insecureWinnerTakesItAll = InsecureWinnerTakesItAll;
      firstUser = FirstUser;
    });
    it('block.timestamp가 challengeEnd보다 작으면 revert한다.', async () => {
      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mine');
      await expect(insecureWinnerTakesItAll.claimLeader()).to.be.revertedWith(
        'Challenge is finished'
      );
      await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
      ethers.provider.send('evm_increaseTime', [-40000]);
      ethers.provider.send('evm_mine');
    });
    it('msg.sender == currentLeader이면 revert한다.', async () => {
      await insecureWinnerTakesItAll
        .connect(owner)
        .claimLeader({ value: ethers.parseEther('11') });
      await expect(
        insecureWinnerTakesItAll
          .connect(owner)
          .claimLeader({ value: ethers.parseEther('12') })
      ).to.be.revertedWith('You are the current leader');
    });
    it('currentLeader의 Address가 0이면  claimLeader 실행 시 msg.sender가 currentLeader가 된다.', async () => {
      const { InsecureWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );
      await InsecureWinnerTakesItAll.connect(FirstUser).claimLeader({
        value: ethers.parseEther('11'),
      });
      expect(await InsecureWinnerTakesItAll.currentleader()).to.be.equal(
        await FirstUser.getAddress()
      );
    });
    it('챌린지에 참여하기 위해서는 lastDepositedAmount보다 ETH를 더 보내야한다.', async () => {
      const { InsecureWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );
      await expect(
        InsecureWinnerTakesItAll.connect(FirstUser).claimLeader({
          value: ethers.parseEther('9'),
        })
      ).to.be.revertedWith('You must pay more than the current leader');
    });

    it('currentLeader가 있으면 이전 Leader가 참여한 금액의 90%만 돌려준다.', async () => {
      const { InsecureWinnerTakesItAll, FirstUser, SecondUser } =
        await loadFixture(DeployContract);
      expect(await InsecureWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('10')
      );

      await InsecureWinnerTakesItAll.connect(FirstUser).claimLeader({
        value: ethers.parseEther('100'),
      });

      expect(await InsecureWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('110')
      );

      await InsecureWinnerTakesItAll.connect(SecondUser).claimLeader({
        value: ethers.parseEther('200'),
      });

      // 이전 리더에게 돌려줄 금액을 계산
      const refundAmount =
        (ethers.parseEther('100') * ethers.parseEther('9')) /
        ethers.parseEther('10');

      // 새로운 잔액을 계산
      const newBalance =
        ethers.parseEther('110') + ethers.parseEther('200') - refundAmount;

      expect(await InsecureWinnerTakesItAll.getEtherBalance()).to.be.equal(
        newBalance
      );
    });
  });
  describe('claimPrincipalAndReward', () => {
    it('챌린지가 끝나지 않았으면 revert한다.', async () => {
      const { InsecureWinnerTakesItAll } = await loadFixture(DeployContract);
      await expect(
        InsecureWinnerTakesItAll.claimPrincipalAndReward()
      ).to.be.revertedWith('Challenge is not finished yet');
    });

    it("상금을 받으려는 Address가 currentleader이 아니었을 때 'claimPrincipalAndReward'를 실행하면 revert한다.", async () => {
      const { InsecureWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );

      const randomWallet = Wallet.createRandom().connect(ethers.provider);
      await FirstUser.sendTransaction({
        to: await randomWallet.getAddress(),
        value: ethers.parseEther('200'),
      });
      expect(
        await ethers.provider.getBalance(await randomWallet.getAddress())
      ).to.be.equal(ethers.parseEther('200'));

      // First User가 100 ETH를 보내고 리더가 된다.
      await InsecureWinnerTakesItAll.connect(FirstUser).claimLeader({
        value: ethers.parseEther('100'),
      });
      // 블록 타임스탬프를 40000초 증가시켜 챌린지를 종료시킨다.
      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mine');
      // 리더인 First User가 아닌 randomWallet이 claimPrincipalAndReward를 실행하면 revert한다.
      await expect(
        InsecureWinnerTakesItAll.connect(randomWallet).claimPrincipalAndReward()
      ).to.be.revertedWith('You are not the winner');
    });

    it('챌린지가 끝나면 리더는 리더보상 + 리더가 보유한 금액을 받는다.', async () => {
      const { InsecureWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );

      const randomWallet = Wallet.createRandom().connect(ethers.provider);
      await FirstUser.sendTransaction({
        to: await randomWallet.getAddress(),
        value: ethers.parseEther('200'),
      });

      await InsecureWinnerTakesItAll.connect(randomWallet).claimLeader({
        value: ethers.parseEther('100'),
      });

      const leaderBalance = await ethers.provider.getBalance(
        await randomWallet.getAddress()
      );

      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mine');

      await InsecureWinnerTakesItAll.connect(
        randomWallet
      ).claimPrincipalAndReward();

      expect(await InsecureWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
    it('보상을 두번 받으려하면 revert한다.', async () => {
      const { InsecureWinnerTakesItAll, FirstUser } = await loadFixture(
        DeployContract
      );

      await InsecureWinnerTakesItAll.connect(FirstUser).claimLeader({
        value: ethers.parseEther('100'),
      });

      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mine');

      await InsecureWinnerTakesItAll.connect(
        FirstUser
      ).claimPrincipalAndReward();

      await expect(
        InsecureWinnerTakesItAll.connect(FirstUser).claimPrincipalAndReward()
      ).to.be.revertedWith('Reward was claimed');
    });
  });
});
