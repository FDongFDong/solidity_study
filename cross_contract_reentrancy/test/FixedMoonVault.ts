import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractTransactionResponse, FixedNumber, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { FixedMoonVault, MoonToken } from '../typechain-types';
import { expect } from 'chai';

describe('FixedMoonVault', () => {
  const DeployContract = async () => {
    const MoonTokenFactory = await ethers.getContractFactory('MoonToken');
    const MoonToken = await MoonTokenFactory.deploy();
    const FixedMoonVaultFactory = await ethers.getContractFactory(
      'FixedMoonVault'
    );
    const FixedMoonVault = await FixedMoonVaultFactory.deploy(MoonToken);
    const Signers = await ethers.getSigners();

    return { FixedMoonVault, Signers, MoonToken };
  };
  let signers: Signer[];
  let fixedMoonVault: FixedMoonVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let moonToken: MoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  before(async () => {
    const { FixedMoonVault, Signers, MoonToken } = await loadFixture(
      DeployContract
    );
    signers = Signers;
    fixedMoonVault = FixedMoonVault;
    moonToken = MoonToken;
  });

  describe('Constructor', () => {
    it('FixedMoonVault 컨트랙트는 생성자로 MoonToken 컨트랙트의 주소를 갖는다.', async () => {
      expect(await fixedMoonVault.moonToken()).to.be.equal(
        await moonToken.getAddress()
      );
    });
  });
  describe('입금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100');

    it('사용자가 ETH 입금 시 MoonToken이 1대1 비율로 발행된다.', async () => {
      user = signers[3];
      await moonToken.transferOwnership(await fixedMoonVault.getAddress());
      expect(await moonToken.owner()).to.be.eq(
        await fixedMoonVault.getAddress()
      );

      await fixedMoonVault.connect(user).deposit({ value: depositAmount });
      expect(await moonToken.balanceOf(user)).to.be.equal(depositAmount);
      expect(await fixedMoonVault.getBalance()).to.be.equal(depositAmount);
    });
  });
  describe('출금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100');

    it('사용자는 출금시 ETH를 돌려받으며 MoonToken은 소각된다.', async () => {
      const { Signers, FixedMoonVault, MoonToken } = await loadFixture(
        DeployContract
      );
      user = Signers[3];

      await MoonToken.transferOwnership(await FixedMoonVault.getAddress());
      expect(await MoonToken.owner()).to.be.equal(
        await FixedMoonVault.getAddress()
      );

      await FixedMoonVault.connect(user).deposit({ value: depositAmount });
      expect(await FixedMoonVault.getBalance()).to.be.equal(depositAmount);
      expect(await FixedMoonVault.getUserBalance(user)).to.be.equal(
        depositAmount
      );
      await FixedMoonVault.connect(user).withdrawAll();
      expect(await FixedMoonVault.getBalance()).to.be.equal(0n);
      expect(await FixedMoonVault.getUserBalance(user)).to.be.equal(0n);
    });
    it('사용자가 출금 시 잔고가 없으면 revert된다', async () => {
      await expect(fixedMoonVault.withdrawAll()).to.be.revertedWith(
        'Insufficient balance'
      );
    });
  });
});
