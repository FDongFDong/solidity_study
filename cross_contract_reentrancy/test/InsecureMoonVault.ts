import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractTransactionResponse, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { InsecureMoonVault, MoonToken } from '../typechain-types';
import { expect } from 'chai';

describe('InsecureMoonVault', () => {
  const DeployContract = async () => {
    const MoonTokenFactory = await ethers.getContractFactory('MoonToken');
    const MoonToken = await MoonTokenFactory.deploy();
    const InsecureMoonVaultFactory = await ethers.getContractFactory(
      'InsecureMoonVault'
    );
    const InsecureMoonVault = await InsecureMoonVaultFactory.deploy(MoonToken);
    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    return { Signers, InsecureMoonVault, MoonToken, deployer };
  };
  let signers: Signer[];
  let contractDeployer: Signer;
  let insecureMoonVault: InsecureMoonVault & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let moonToken: MoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  before(async () => {
    const { Signers, InsecureMoonVault, MoonToken, deployer } =
      await loadFixture(DeployContract);
    contractDeployer = deployer;
    signers = Signers;
    insecureMoonVault = InsecureMoonVault;
    moonToken = MoonToken;
  });
  describe('Constructor', () => {
    it('InsecureMoonVault 컨트랙트는 생성자로 MoonToken 컨트랙트의 주소를 갖는다.', async () => {
      expect(await insecureMoonVault.moonToken()).to.be.equal(
        await moonToken.getAddress()
      );
    });
  });

  describe('입금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100');

    it('사용자가 ETH 입금 시 MoonToken이 1대1 비율로 발행된다.', async () => {
      user = signers[3];
      await moonToken.transferOwnership(await insecureMoonVault.getAddress());
      expect(await moonToken.owner()).to.equal(
        await insecureMoonVault.getAddress()
      );

      await insecureMoonVault.connect(user).deposit({ value: depositAmount });
      expect(await moonToken.balanceOf(user)).to.be.equal(depositAmount);
      expect(await insecureMoonVault.getBalance()).to.be.equal(depositAmount);
    });
  });
  describe('출금', () => {
    let user: Signer;
    const depositAmount = ethers.parseEther('100');
    it('사용자는 출금시 ETH를 돌려받으며 MoonToken은 소각된다.', async () => {
      const { Signers, InsecureMoonVault, MoonToken, deployer } =
        await loadFixture(DeployContract);
      user = Signers[3];
      await MoonToken.transferOwnership(await InsecureMoonVault.getAddress());
      expect(await MoonToken.owner()).to.be.equal(
        await InsecureMoonVault.getAddress()
      );
      await InsecureMoonVault.connect(user).deposit({ value: depositAmount });
      expect(await InsecureMoonVault.getBalance()).to.be.equal(depositAmount);
      expect(await InsecureMoonVault.getUserBalance(user)).to.be.equal(
        depositAmount
      );

      await insecureMoonVault.connect(user).withdrawAll();
      expect(await InsecureMoonVault.getBalance()).to.be.equal(0n);
      expect(await InsecureMoonVault.getUserBalance(user)).to.be.equal(0n);
    });
    it('사용자가 출금 시 잔고가 없으면 revert된다.', async () => {
      const { Signers, InsecureMoonVault, MoonToken, deployer } =
        await loadFixture(DeployContract);
      user = Signers[3];
      await MoonToken.transferOwnership(await InsecureMoonVault.getAddress());

      await expect(
        InsecureMoonVault.connect(user).withdrawAll()
      ).to.be.revertedWith('Insufficient balance');
    });
  });
});
