import { ethers } from 'hardhat';
import {
  FixedAirdrop,
  MockAirdropReceiverFalse,
  MockAirdropReceiverTrue,
} from '../typechain-types';
import { FixedNumber, Signer, ContractTransactionResponse } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

describe('FixedAirdrop', () => {
  const airdropAmount = ethers.toBigInt(100);
  const deployFixedAirdrop = async () => {
    const FixedAirdropFactory = await ethers.getContractFactory('FixedAirdrop');
    const FixedAirdrop = await FixedAirdropFactory.deploy(airdropAmount);
    const Signers = await ethers.getSigners();

    return { FixedAirdrop, Signers };
  };
  let fixedAirdrop: FixedAirdrop;
  let signers: Signer[];
  before(async () => {
    const { FixedAirdrop, Signers } = await loadFixture(deployFixedAirdrop);
    fixedAirdrop = FixedAirdrop;
    signers = Signers;
  });

  describe('Constructor', () => {
    it('FixedAirdrop Contract가 처음 배포되었을 때 airdrop시 개수를 정할 수 있다.', async () => {
      expect(await fixedAirdrop.airdropAmount()).to.be.equal(airdropAmount);
    });
  });
  describe('에어드랍', () => {
    let user: Signer;
    it('에어드랍을 받을 수 있다.', async () => {
      user = signers[1];
      await fixedAirdrop.connect(user).receiveAirdrop();
      expect(await fixedAirdrop.getUserBalance(user)).to.be.equal(
        airdropAmount
      );
    });
    it('특정 유저가 에어드랍을 받았는지 확인할 수 있다.', async () => {
      expect(await fixedAirdrop.hasReceivedAirdrop(user)).to.be.true;
    });

    it('유저는 두번 이상 에어드랍을 요청할 수 없다.', async () => {
      await expect(
        fixedAirdrop.connect(user).receiveAirdrop()
      ).to.be.rejectedWith('You already received an Airdrop');
    });
  });

  describe('Mock', () => {
    // let mockAirdropReceiverFalse: ;
    let mockAirdropReceiverTrue: MockAirdropReceiverTrue & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let mockAirdropReceiverFalse: MockAirdropReceiverFalse & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    before(async () => {
      const deployMockAirdropReceiver = async () => {
        const MockAirdropReceiverTrueFactory = await ethers.getContractFactory(
          'MockAirdropReceiverTrue'
        );
        const MockAirdropReceiverTrue =
          await MockAirdropReceiverTrueFactory.deploy();
        const MockAirdropReceiverFalseFactory = await ethers.getContractFactory(
          'MockAirdropReceiverFalse'
        );
        const MockAirdropReceiverFalse =
          await MockAirdropReceiverFalseFactory.deploy();
        return { MockAirdropReceiverFalse, MockAirdropReceiverTrue };
      };
      const { MockAirdropReceiverTrue, MockAirdropReceiverFalse } =
        await loadFixture(deployMockAirdropReceiver);
      mockAirdropReceiverTrue = MockAirdropReceiverTrue;
      mockAirdropReceiverFalse = MockAirdropReceiverFalse;
    });
    it('Contract Address가 에어드랍을 받을 수 있는 Contract일 경우 에어드랍을 받는다.', async () => {
      await mockAirdropReceiverTrue.triggerReceiveAirdrop(
        await fixedAirdrop.getAddress()
      );
      expect(
        await fixedAirdrop.hasReceivedAirdrop(
          await mockAirdropReceiverTrue.getAddress()
        )
      );
      expect(
        await fixedAirdrop.getUserBalance(
          await mockAirdropReceiverTrue.getAddress()
        )
      ).to.be.equal(airdropAmount);
    });
    it('Contract Address가 에어드랍을 받을 수 없는 컨트랙트일 경우 revert를 호출한다.', async () => {
      await expect(
        mockAirdropReceiverFalse.triggerReceiveAirdrop(
          fixedAirdrop.getAddress()
        )
      ).to.be.revertedWith('Receiver cannot receive an airdrop');
    });
  });
});
