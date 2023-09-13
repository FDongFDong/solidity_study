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
    let mintAmount = ethers.parseEther('1000');
    it('to 주소로 토큰을 전송할 수 있다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);

      await MoonToken.connect(deployer).mint(deployer, mintAmount);
      const receiver = signers[1];
      const amount = ethers.parseEther('10');
      await MoonToken.transfer(await receiver.getAddress(), amount);
      expect(await MoonToken.balanceOf(receiver)).to.be.equal(amount);
    });
    it('보내려는 Token의 개수보다 적으면 revert된다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      const user = signers[3];

      await expect(
        MoonToken.connect(deployer).transfer(
          await user.getAddress(),
          mintAmount
        )
      ).to.be.reverted;
    });
  });
  describe('transferFrom', () => {
    let sender: Signer;
    let receiver: Signer;

    it('다른 사용자에게 토큰을 전송할 권한을 부여하면 토큰을 전송할 수 있다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      sender = signers[3];
      receiver = signers[4];
      const mintAmount = ethers.parseEther('100');
      await MoonToken.connect(deployer).mint(sender, mintAmount);

      expect(await MoonToken.balanceOf(sender)).to.be.equal(mintAmount);
      // sender가 deployer에게 50개의 토큰을 보낼 권한을 준다.
      await MoonToken.connect(sender).approve(deployer, mintAmount / 2n);
      // 실제 50개를 전송할 권한을 가졌는지 확인
      expect(await MoonToken.allowance(sender, deployer)).to.be.equal(
        mintAmount / 2n
      );
      // sender는 100개를 가지고 있다.
      expect(await MoonToken.balanceOf(sender)).to.be.equal(mintAmount);
      // receiver는 0개를 가지고 있다.
      expect(await MoonToken.balanceOf(receiver)).to.be.equal(0n);

      // deployer가 sender의 토큰의 receiver로 50개 전송한다.
      await MoonToken.connect(deployer).transferFrom(
        sender,
        receiver,
        mintAmount / 2n
      );
      // sender는 50개를 가지고 있다.
      expect(await MoonToken.balanceOf(sender)).to.be.equal(mintAmount / 2n);
      // receiver는 50개를 가지고 있다.
      expect(await MoonToken.balanceOf(receiver)).to.be.equal(mintAmount / 2n);
    });
    it('허용되지 않은 사용자가 토큰을 전송하려고 하면 거부된다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      sender = signers[3];
      receiver = signers[4];

      const mintAmount = ethers.parseEther('100');
      await MoonToken.connect(deployer).mint(sender, mintAmount);
      expect(await MoonToken.balanceOf(sender)).to.be.equal(mintAmount);
      // deployer는 sender의 토큰을 전송할 권한을 부여 받지 않아 0개 전송이 가능하다.
      expect(await MoonToken.allowance(sender, deployer)).to.be.equal(0n);
      await expect(moonToken.transferFrom(sender, receiver, mintAmount)).to.be
        .reverted;
    });
    it('허용된 사용자가 허용된 한도를 초과하여 토큰을 전송하려하면 거부된다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      sender = signers[3];
      receiver = signers[4];
      const MAX_UINT256 = ethers.MaxUint256;

      const mintAmount = ethers.parseEther('100');
      await MoonToken.connect(deployer).mint(sender, mintAmount);
      expect(await MoonToken.balanceOf(sender)).to.be.equal(mintAmount);
      await MoonToken.connect(sender).approve(deployer, MAX_UINT256);
      expect(await MoonToken.allowance(sender, deployer)).to.be.equal(
        MAX_UINT256
      );
      await expect(
        MoonToken.connect(deployer).transferFrom(sender, receiver, MAX_UINT256)
      ).to.be.reverted;
    });
  });
  describe('balanceOf', () => {
    it('사용자가 가진 토큰의 개수를 확인할 수 있다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      const sender = signers[3];
      await MoonToken.connect(deployer).mint(sender, ethers.parseEther('100'));
      expect(await MoonToken.balanceOf(sender)).to.be.equal(
        ethers.parseEther('100')
      );
    });
  });
  describe('approve', () => {
    it('사용자가 특정 주소에 특정 양의 토큰을 사용할 수 있도록 허용할 수 있다.', async () => {
      const mintAmount = ethers.parseEther('100');
      const user = signers[3];
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      await MoonToken.connect(deployer).mint(deployer, mintAmount);
      expect(await MoonToken.balanceOf(deployer)).to.be.equal(mintAmount);

      await MoonToken.connect(deployer).approve(user, mintAmount);
      expect(await MoonToken.allowance(deployer, user)).to.be.equal(mintAmount);
    });
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
    let user: Signer;
    it('Owner가 특정 주소의 토큰을 소각할 수 있다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      user = signers[3];
      const mintAmount = ethers.parseEther('100');
      await MoonToken.connect(deployer).mint(user, mintAmount);
      expect(await MoonToken.balanceOf(user)).to.be.equal(mintAmount);

      await MoonToken.connect(deployer).burnAccount(user);
      expect(await MoonToken.balanceOf(user)).to.be.equal(0n);
    });

    it('비 Owner는 특정 수조의 토큰을 소각할 수 없다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      user = signers[3];

      await expect(MoonToken.connect(user).burnAccount(user)).revertedWith(
        'You are not the owner'
      );
    });

    it('토큰을 소각하면 총 공급량이 업데이트 된다.', async () => {
      const { MoonToken, deployer } = await loadFixture(DeployMoonToken);
      const mintAmount = ethers.parseEther('1000');
      user = signers[3];
      // 초기엔 모두 0이다.
      expect(await MoonToken.balanceOf(user)).to.be.equal(0n);
      expect(await MoonToken.totalSupply()).to.be.equal(0n);
      // 1000개 발행
      await MoonToken.connect(deployer).mint(user, mintAmount);
      expect(await MoonToken.balanceOf(user)).to.be.equal(mintAmount);
      expect(await MoonToken.totalSupply()).to.be.equal(mintAmount);
      // 토큰 소각 후 공급량 확인
      await MoonToken.burnAccount(user);
      expect(await MoonToken.balanceOf(user)).to.be.equal(0n);
      expect(await MoonToken.totalSupply()).to.be.equal(0n);
    });
  });
});
