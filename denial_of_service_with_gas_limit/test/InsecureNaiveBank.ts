import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { InsecureNaiveBank } from '../typechain-types';
import { ContractTransactionResponse } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
describe('InsecureNaiveBank', () => {
  const DeployContract = async () => {
    const InsecureNaiveBankFactory = await ethers.getContractFactory(
      'InsecureNaiveBank'
    );
    const InsecureNaiveBank = await InsecureNaiveBankFactory.deploy();
    const [Owner, FirstUser, SecondUser, ThirdUser] = await ethers.getSigners();
    return { InsecureNaiveBank, Owner, FirstUser, SecondUser, ThirdUser };
  };

  let insecureNaiveBank: InsecureNaiveBank & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let owner: HardhatEthersSigner;
  let firstUser: HardhatEthersSigner;
  let secondUser: HardhatEthersSigner;
  let thirdUser: HardhatEthersSigner;
  before(async () => {
    const { Owner, InsecureNaiveBank, FirstUser, SecondUser, ThirdUser } =
      await loadFixture(DeployContract);
    insecureNaiveBank = InsecureNaiveBank;
    owner = Owner;
    firstUser = FirstUser;
    secondUser = SecondUser;
    thirdUser = ThirdUser;
  });

  describe('Constructor', () => {
    it('배포 시 배포자가 Owner로 설정되어 있다', async () => {
      expect(await insecureNaiveBank.owner()).to.be.equal(
        await owner.getAddress()
      );
    });
    it('배포 시 이자는 5%로 설정되어 있다.', async () => {
      expect(await insecureNaiveBank.INTEREST_RATE()).to.be.equal(5);
    });
  });
});
