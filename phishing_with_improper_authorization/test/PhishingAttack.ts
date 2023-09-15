import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
  InsecureDonation,
  PhishingAttack,
  PhishingAttack__factory,
} from '../typechain-types';
import { ContractTransactionResponse, Signer } from 'ethers';

describe('PhishingAttack', () => {
  const DeployContract = async () => {
    const InsecureDonationFactory = await ethers.getContractFactory(
      'InsecureDonation'
    );
    const InsecureDonation = await InsecureDonationFactory.deploy();

    const PhishingAttackFactory = await ethers.getContractFactory(
      'PhishingAttack'
    );
    const PhishingAttack = await PhishingAttackFactory.deploy(InsecureDonation);
    const Signers = await ethers.getSigners();
    return { Signers, PhishingAttack, InsecureDonation };
  };

  let phishingAttack: PhishingAttack & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let signers: Signer[];
  let insecureDonation: InsecureDonation & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { PhishingAttack, Signers, InsecureDonation } = await loadFixture(
      DeployContract
    );
    phishingAttack = PhishingAttack;
    signers = Signers;
    insecureDonation = InsecureDonation;
  });
  describe('Constructor', () => {
    it('초기 배포 시 InsecureDonation 컨트랙트의 주소를 받는다.', async () => {
      const { Signers, PhishingAttack, InsecureDonation } = await loadFixture(
        DeployContract
      );

      expect(await PhishingAttack.donationContract()).to.be.equal(
        await InsecureDonation.getAddress()
      );
    });
  });
  describe('공격', () => {
    let user: Signer;

    it('user가 InsecureDonation 컨트랙트에 10이더를 기부할 수 있다.', async () => {
      await insecureDonation.buyMeACoffee({ value: ethers.parseEther('10') });
      expect(await insecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });
    it('PhishingAttack 컨트랙트의 초기 자금은 0이다.', async () => {
      expect(await phishingAttack.getBalance()).to.be.equal(0);
    });
    it('InsecureDonation에 있는 ETH를 모두 가져올 수 있다.', async () => {
      expect(await insecureDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );

      // InsecureDonation 컨트랙트에 있는 ETH를 모두 빼내온다.
      await phishingAttack.bait();
      // 공격 후 PhishingAttack 컨트랙트에는 10 ETH가 있는 것을 확인할 수 있다.
      expect(await phishingAttack.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );
    });
  });
  describe('공격 실패', () => {
    let user: Signer;
    it('FixedDonation 컨트랙트에 10이더를 기부할 수 있다.', async () => {
      const FixedDonationFactory = await ethers.getContractFactory(
        'FixedDonation'
      );
      const FixedDonation = await FixedDonationFactory.deploy();

      const FixedPhishingAttackFactory = await ethers.getContractFactory(
        'PhishingAttack'
      );
      const FixedPhishingAttack = await FixedPhishingAttackFactory.deploy(
        FixedDonation
      );

      expect(await FixedPhishingAttack.donationContract()).to.be.equal(
        await FixedDonation.getAddress()
      );

      // FixedDonation 컨트랙트에 10이더를 기부한다.
      await FixedDonation.buyMeACoffee({ value: ethers.parseEther('10') });
      expect(await FixedDonation.getBalance()).to.be.equal(
        ethers.parseEther('10')
      );

      // 공격 실패
      await expect(FixedPhishingAttack.bait()).to.be.revertedWith('Not owner');
    });
  });
});
