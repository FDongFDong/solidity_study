import { Signer, ContractTransactionResponse } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { MoonToken } from '../typechain-types';
import { expect } from 'chai';

describe('MoonToken', () => {
  const DeployMoonToken = async () => {
    const MoonTokenFactory = await ethers.getContractFactory('MoonToken');
    const MoonToken = await MoonTokenFactory.deploy();
    const Signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    return { MoonToken, Signers, deployer };
  };

  let moonToken: MoonToken & {
    deploymentTransaction(): ContractTransactionResponse;
  };
  let contractDeployer: Signer;
  let signers: Signer[];
  before(async () => {
    const { MoonToken, Signers, deployer } = await loadFixture(DeployMoonToken);
    moonToken = MoonToken;
    signers = Signers;
    contractDeployer = deployer;
  });
  describe('Constructor', () => {
    it('Contract의 Owner를 확인할 수 있다.', async () => {
      expect(await moonToken.owner()).to.be.equal(
        await signers[0].getAddress()
      );
    });
  });
  describe('transferOwnership', () => {
    let newOwner: Signer;
    it('Owner는 소유권을 변경할 수 있다.', async () => {
      newOwner = signers[1];
      await moonToken.transferOwnership(await newOwner.getAddress());
      expect(await moonToken.owner()).to.be.equal(await newOwner.getAddress());
    });
    it('Owner가 아니면 소유권을 변경할 수 없다.', async () => {
      await expect(
        moonToken
          .connect(signers[2])
          .transferOwnership(await newOwner.getAddress())
      ).to.be.revertedWith('You are not the owner');
    });
  });
  describe('transfer', () => {
    let owner: Signer;
    let mintAmount = ethers.parseEther('1000');
    it('to 주소로 토큰을 전송할 수 있다.', async () => {
      const { MoonToken } = await loadFixture(DeployMoonToken);

      moonToken = MoonToken;
      owner = contractDeployer;
      await moonToken.connect(owner).mint(owner, mintAmount);
      const receiver = signers[1];
      const amount = ethers.parseEther('10');
      await moonToken.transfer(await receiver.getAddress(), amount);
      expect(await moonToken.balanceOf(receiver)).to.be.equal(amount);
    });
    it('보내려는 Token의 개수보다 적으면 revert된다.', async () => {});
  });
  describe('transferFrom', () => {
    it('다른 사용자에게 토큰을 전송할 권한을 부여하면 토큰을 전송할 수 있다.', async () => {});
    it('허용되지 않은 사용자가 토큰을 전송하려고 하면 거부된다.', async () => {});
    it('허용된 사용자가 허용된 한도를 초과하여 토큰을 전송하려하면 거부된다.', async () => {});
  });
  describe('balanceOf', () => {
    it('사용자가 가진 토큰의 개수를 확인할 수 있다.', async () => {});
  });
  describe('approve', () => {
    it('사용자가 특정 주소에 특정 양의 토큰을 사용할 수 있도록 허용할 수 있다.', async () => {});
  });
  describe('mint', () => {
    let nonOwner: Signer;
    const totalAmount = ethers.parseEther('1000');

    it('Owner가 토큰을 발행할 수 있다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      await MoonToken.connect(deployer).mint(deployer, totalAmount);
      expect(await moonToken.totalSupply()).to.be.equal(totalAmount);
    });
    it('비 Owner는 토큰을 발행할 수 없다.', async () => {
      nonOwner = signers[2];
      await expect(
        moonToken.connect(nonOwner).mint(nonOwner, totalAmount)
      ).to.be.revertedWith('You are not the owner');
    });
    it('mint 함수를 호출 하면 총 공급량이 업데이트된다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      await MoonToken.connect(deployer).mint(deployer, totalAmount);
      await MoonToken.connect(deployer).mint(deployer, totalAmount);
      expect(await MoonToken.totalSupply()).to.be.equal(totalAmount * 2n);
    });
  });
  describe('burnAccount', () => {
    it('Owner가 특정 주소의 토큰을 소각할 수 있다.', async () => {});
    it('비 Owner는 특정 수조의 토큰을 소각할 수 없다.', async () => {});
    it('토큰을 소각하면 총 공급량이 업데이트 된다.', async () => {});
  });
});
