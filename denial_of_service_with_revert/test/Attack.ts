import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Attack, InsecureWinnerTakesItAll } from '../typechain-types';
import { ContractTransactionResponse, Signer } from 'ethers';

describe('Attack', () => {
  const challengePeriod = 3000;
  const DeployContract = async () => {
    const InsecureWinnerTakesItAllFactory = await ethers.getContractFactory(
      'InsecureWinnerTakesItAll'
    );
    const InsecureWinnerTakesItAll =
      await InsecureWinnerTakesItAllFactory.deploy(challengePeriod, {
        value: ethers.parseEther('10'),
      });
    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(InsecureWinnerTakesItAll);
    const [Owner, FirstUser, SecondUser, ThirdUser] = await ethers.getSigners();
    return {
      Owner,
      FirstUser,
      SecondUser,
      ThirdUser,
      InsecureWinnerTakesItAll,
      Attack,
    };
  };

  describe('constructor', () => {
    it('Attack 컨트랙트의 owner는 배포자이다.', async () => {
      const { Owner, Attack } = await loadFixture(DeployContract);
      expect(await Attack.owner()).to.be.equal(await Owner.getAddress());
    });
    it('Attack 컨트랙트의 InsecureWinnerTakesItAll 컨트랙트 주소는 배포한 컨트랙트 주소이다.', async () => {
      const { Attack, InsecureWinnerTakesItAll } = await loadFixture(
        DeployContract
      );
      expect(await Attack.targetContract()).to.be.equal(
        await InsecureWinnerTakesItAll.getAddress()
      );
    });
  });
  describe('attack', () => {
    let insecureWinnerTakesItAll: InsecureWinnerTakesItAll & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let attack: Attack & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let attacker: Signer;
    let firstUser: Signer;
    let secondUser: Signer;

    before(async () => {
      const { InsecureWinnerTakesItAll, Attack, FirstUser, SecondUser, Owner } =
        await loadFixture(DeployContract);
      insecureWinnerTakesItAll = InsecureWinnerTakesItAll;
      attack = Attack;
      attacker = Owner;
      firstUser = FirstUser;
      secondUser = SecondUser;
    });
    it('owner가 아니면 attack 함수는 호출할 수 없다.', async () => {
      await expect(attack.connect(firstUser).attack()).to.be.revertedWith(
        'You are not the owner'
      );
    });
    it('사전 작업 - First User와 Second User가 경쟁적으로 InseceureWinnerTakesItAll 컨트랙트에 ETH를 보낸다.', async () => {
      // First User가 15 ETH를 보낸다.
      await insecureWinnerTakesItAll
        .connect(firstUser)
        .claimLeader({ value: ethers.parseEther('15') });

      // Second User가 20 ETH를 보낸다.
      await insecureWinnerTakesItAll
        .connect(secondUser)
        .claimLeader({ value: ethers.parseEther('20') });

      // First User가 30 ETH를 보낸다.
      await insecureWinnerTakesItAll
        .connect(firstUser)
        .claimLeader({ value: ethers.parseEther('30') });
      // Second User가 50 ETH를 보낸다.
      await insecureWinnerTakesItAll
        .connect(secondUser)
        .claimLeader({ value: ethers.parseEther('50') });
      expect(await insecureWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('66.5')
      );
    });
    it('attack 함수를 호출하여 InsecureWinnerTakesItAll 컨트랙트의 claimLeader()의 기능을 사용하지 못하도록할 수 있다.', async () => {
      // Attacker가 리더를 차지하기 위해 66.5 ETH보다 조금 더 많은 ETH인 66.6 ETH를 함께 보낸다.
      await attack
        .connect(attacker)
        .attack({ value: ethers.parseEther('66.6') });

      // 아무것도 모르는 first user가 리더가 되려고 70 ETH를 추가로 보내지만 실패한다.
      await expect(
        insecureWinnerTakesItAll
          .connect(firstUser)
          .claimLeader({ value: ethers.parseEther('70') })
      ).to.be.revertedWith('Failed to send Ether');

      // 챌린지 시간 종료
      ethers.provider.send('evm_increaseTime', [40000]);
      ethers.provider.send('evm_mine');
      // 공격자가 리더이기에 보상을 받는다.
      await attack.connect(attacker).claimPrincipalAndReward();

      expect(await insecureWinnerTakesItAll.getEtherBalance()).to.be.equal(
        ethers.parseEther('0')
      );
    });
  });
});
