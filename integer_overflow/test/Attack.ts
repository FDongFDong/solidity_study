import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { Attack, FixedMoonToken, InsecureMoonToken } from '../typechain-types';
import { expect } from 'chai';

describe('Attack', () => {
  const DeployContract = async () => {
    const InsecureMoonTokenFactory = await ethers.getContractFactory(
      'InsecureMoonToken'
    );

    const InsecureMoonToken = await InsecureMoonTokenFactory.deploy();

    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(InsecureMoonToken);
    const [deployer] = await ethers.getSigners();
    const Signers = await ethers.getSigners();
    return { Signers, InsecureMoonToken, Attack, deployer };
  };

  let insecureMoonToken: InsecureMoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let signers: Signer[];
  let attack: Attack & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { InsecureMoonToken, Attack, Signers } = await loadFixture(
      DeployContract
    );

    insecureMoonToken = InsecureMoonToken;
    signers = Signers;
    attack = Attack;
  });

  describe('Constructor', () => {
    it('Attack 배포 시 InsecureMoonToken 컨트랙트의 주소를 함께 저장한다.', async () => {
      expect(await attack.moonToken()).to.be.equal(
        await insecureMoonToken.getAddress()
      );
    });
    it('Attack 배포 시 Token Price 값을 확인할 수 있다.', async () => {
      expect(await attack.TOKEN_PRICE()).to.be.equal(ethers.parseEther('1'));
    });
  });

  describe('공격', () => {
    let firstUser: Signer;
    let secondUser: Signer;
    before(async () => {
      const { InsecureMoonToken, Attack, Signers } = await loadFixture(
        DeployContract
      );
      firstUser = Signers[3];
      secondUser = Signers[4];
      insecureMoonToken = InsecureMoonToken;
      attack = Attack;
    });
    it('2명의 유저가 InsecureMoonToken 컨트랙트에 총 50 ETH를 입금할 수 있다.', async () => {
      expect(
        await insecureMoonToken.connect(firstUser).buy(20, {
          value: ethers.parseEther('20'),
        })
      );
      expect(await insecureMoonToken.getUserBalance(firstUser)).to.be.equal(20);

      expect(
        await insecureMoonToken.connect(secondUser).buy(30, {
          value: ethers.parseEther('30'),
        })
      );
      expect(await insecureMoonToken.getUserBalance(secondUser)).to.be.equal(
        30
      );
      expect(await insecureMoonToken.getEtherBalance()).to.be.equal(
        ethers.parseEther('50')
      );
    });
    it('공격 시 일정량의 ETH를 넣지 않으면 revert된다.', async () => {
      await expect(
        attack.attackBuy({ value: ethers.parseEther('1') })
      ).to.be.revertedWith('Ether received mismatch');
    });
    it('공격자가 공격해서 InsecureMoonToken에 있는 ETH를 모두 가져올 수 있다.', async () => {
      // [공격 시작]
      // 1. 공격에 필요한 ETH 수를 구한다.
      const requireEthAmount = await attack.getEthersRequired();
      // 2. ETH를 공급하여 토큰을 구입한다.
      await attack.attackBuy({ value: requireEthAmount });
      // 3. 확인 - 토큰의 개수와 Attack.calculateTokenToBuy()로 구한 값이 동일한지 비교
      expect(
        await insecureMoonToken.getUserBalance(await attack.getAddress())
      ).to.equal(await attack.calculateTokenToBuy());
      // 3.1. Attack 컨트랙트에 있는 ETH 개수
      expect(await attack.getEtherBalance()).to.be.equal(
        ethers.parseEther('0')
      );
      // 4. InsecureMoonToken 컨트랙트에 있는 모든 토큰을 판매하고 ETH를 받아온다.
      await attack.attackSell();
      expect(await attack.getEtherBalance()).to.be.equal(
        ethers.parseEther('50')
      );
    });
  });
  describe('공격 실패', () => {
    const DeployFixedAttack = async () => {
      const FixedMoonTokenFactory = await ethers.getContractFactory(
        'FixedMoonToken'
      );
      const FixedMoonToken = await FixedMoonTokenFactory.deploy();
      const FixedAttackFactory = await ethers.getContractFactory('Attack');
      const FixedAttack = await FixedAttackFactory.deploy(FixedMoonToken);
      const Signers = await ethers.getSigners();
      return { Signers, FixedAttack, FixedMoonToken };
    };
    let fixedAttack: Attack & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let fixedMoonToken: FixedMoonToken & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let signers: Signer[];
    let firstUser: Signer;
    let secondUser: Signer;
    before(async () => {
      const { Signers, FixedAttack, FixedMoonToken } = await loadFixture(
        DeployFixedAttack
      );
      fixedMoonToken = FixedMoonToken;
      fixedAttack = FixedAttack;
      firstUser = Signers[3];
      secondUser = Signers[4];
    });

    it('2명의 유저가 InsecureMoonToken 컨트랙트에 총 50 ETH를 입금할 수 있다.', async () => {
      await fixedMoonToken
        .connect(firstUser)
        .buy(20, { value: ethers.parseEther('20') });

      await fixedMoonToken
        .connect(secondUser)
        .buy(30, { value: ethers.parseEther('30') });

      expect(await fixedMoonToken.getEtherBalance()).to.be.equal(
        ethers.parseEther('50')
      );
    });
    it('공격자는 FixedMoonToken에 있는 ETH를 가져올 수 없다.', async () => {
      // [공격 시작]
      const requireEthAmount = await fixedAttack.getEthersRequired();

      await expect(
        fixedAttack.attackBuy({ value: requireEthAmount })
      ).to.be.revertedWith('SafeMath: multiplication overflow');
    });
  });
});
