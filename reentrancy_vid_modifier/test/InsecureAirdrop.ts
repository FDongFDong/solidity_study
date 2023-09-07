import { ethers } from 'hardhat';
import { InsecureAirdrop } from '../typechain-types/InsecureAirdrop';
import { Signer, ContractTransactionResponse } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

import {
  IAirdropReceiver,
  MockAirdropReceiverFalse,
  MockAirdropReceiverTrue,
} from '../typechain-types';
import { sign } from 'crypto';

describe('InsecureAirdrop', () => {
  const deployInsecureAirdrop = async () => {
    const InsecureAirdropFactory =
      await ethers.getContractFactory('InsecureAirdrop');
    const airdropAmount: bigint = ethers.toBigInt(100);
    const InsecureAirdrop = await InsecureAirdropFactory.deploy(airdropAmount);
    const Signer = await ethers.getSigners();
    return { InsecureAirdrop, Signer };
  };

  let insecureAirdrop: InsecureAirdrop;
  let signer: Signer[];

  before(async () => {
    const { InsecureAirdrop, Signer } = await loadFixture(
      deployInsecureAirdrop
    );

    insecureAirdrop = InsecureAirdrop;

    signer = Signer;
  });

  describe('Constructor', () => {
    it('에어드랍에 사용될 개수를 초기값으로 줄 수 있다.', async () => {
      const tempInsecureAirdropFactory =
        await ethers.getContractFactory('InsecureAirdrop');
      const airdropAmount = ethers.toBigInt(100);
      const tempInsecureAirdrop =
        await tempInsecureAirdropFactory.deploy(airdropAmount);
      expect(await tempInsecureAirdrop.airdropAmount()).to.be.equal(
        airdropAmount
      );
    });
  });
  describe('에어드랍', () => {
    let user: Signer;
    it('에어드랍을 받을 수 있다.', async () => {
      user = signer[1];
      // first_user가 에어드랍 함수를 호출하여 에어드랍을 받는다.
      await insecureAirdrop.connect(user).receiveAirdrop();
      expect(await insecureAirdrop.getUserBalance(user)).to.be.equal(
        ethers.toBigInt(100)
      );
    });
    it('특정 유저가 에어드랍을 받았는지 확인할 수 있다.', async () => {
      expect(await insecureAirdrop.hasReceivedAirdrop(user)).to.be.true;
    });
    it('유저는 두번이상 에어드랍을 요청할 수 없다.', async () => {
      await expect(
        insecureAirdrop.connect(user).receiveAirdrop()
      ).to.be.revertedWith('You already received an Airdrop');
    });
  });
  describe('Mock', () => {
    console.log('mock');
    // Deploy Mock Contract
    let mockAirdropReceiverFalse: MockAirdropReceiverFalse & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    let mockAirdropReceiverTrue: MockAirdropReceiverTrue & {
      deploymentTransaction(): ContractTransactionResponse;
    };
    before(async () => {
      const deployMockAirdropReceiver = async () => {
        const MockAirdropReceiverFalseFactory = await ethers.getContractFactory(
          'MockAirdropReceiverFalse'
        );
        const MockAirdropReceiverTrueFactory = await ethers.getContractFactory(
          'MockAirdropReceiverTrue'
        );
        const MockAirdropReceiverFalse =
          await MockAirdropReceiverFalseFactory.deploy();
        const MockAirdropReceiverTrue =
          await MockAirdropReceiverTrueFactory.deploy();
        return { MockAirdropReceiverFalse, MockAirdropReceiverTrue };
      };

      const { MockAirdropReceiverFalse, MockAirdropReceiverTrue } =
        await loadFixture(deployMockAirdropReceiver);
      mockAirdropReceiverFalse = MockAirdropReceiverFalse;
      mockAirdropReceiverTrue = MockAirdropReceiverTrue;
    });

    it('Contract Address가 에어드랍을 받을 수 있는 컨트랙트 일 경우 에어드랍을 받는다.', async () => {
      await mockAirdropReceiverTrue.triggerReceiveAirdrop(
        insecureAirdrop.getAddress()
      );
      expect(
        await insecureAirdrop.hasReceivedAirdrop(
          mockAirdropReceiverTrue.getAddress()
        )
      ).to.be.true;
      expect(
        await insecureAirdrop.getUserBalance(
          await mockAirdropReceiverTrue.getAddress()
        )
      ).to.be.equal(ethers.toBigInt(100));
    });
    it('Contract Address가 에어드랍을 받을 수 없는 컨트랙트 일 경우 revert를 호출한다.', async () => {
      await expect(
        mockAirdropReceiverFalse.triggerReceiveAirdrop(
          insecureAirdrop.getAddress()
        )
      ).to.be.revertedWith('Receiver cannot receive an airdrop');
    });
  });
});
