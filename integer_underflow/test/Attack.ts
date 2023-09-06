import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { Attack, InsecureEtherVault } from '../typechain-types';
import { Signer } from 'ethers';
import { expect } from 'chai';
describe('Attack', () => {
  const deployAttack = async () => {
    const Signer = await ethers.getSigners();
    const InsecureEtherVaultFactory =
      await ethers.getContractFactory('InsecureEtherVault');
    const InsecureEtherVault = await InsecureEtherVaultFactory.deploy();
    const AttackFactory = await ethers.getContractFactory('Attack');
    const Attack = await AttackFactory.deploy(InsecureEtherVault);
    return { Signer, Attack, InsecureEtherVault };
  };
  let attack: Attack;
  let signer: Signer[];
  let insecureEtherVault: InsecureEtherVault;

  before(async () => {
    const { Attack, Signer, InsecureEtherVault } =
      await loadFixture(deployAttack);
    attack = Attack;
    signer = Signer;
    insecureEtherVault = InsecureEtherVault;
  });

  describe('Constructor', () => {
    it('Attack 컨트랙트에 insecureEtherVault 컨트랙트가 등록되어 있다.', async () => {
      expect(await attack.etherVault()).to.be.equal(
        await insecureEtherVault.getAddress(),
      );
    });
  });

  describe('공격', () => {
    it('attack() 함수를 호출하면 InsecureEtherVault 컨트랙트에 있는 모든 잔액이 출금된다.', async () => {
      const { Attack, Signer, InsecureEtherVault } =
        await loadFixture(deployAttack);
      attack = Attack;
      signer = Signer;
      insecureEtherVault = InsecureEtherVault;

      // user1과 User2가 입금한다. = 20,25
      const user1 = signer[1];
      const user2 = signer[2];
      const user1DepositAmount = ethers.parseEther('20.0');
      const user2DepositAmount = ethers.parseEther('25.0');
      await insecureEtherVault
        .connect(user1)
        .deposit({ value: user1DepositAmount });
      await insecureEtherVault
        .connect(user2)
        .deposit({ value: user2DepositAmount });

      // InsecureEtherVault 컨트랙트에 입금된 총 이더를 확인한다. = 45
      expect(await insecureEtherVault.getEtherBalance()).to.be.equal(
        user1DepositAmount + user2DepositAmount,
      );
      // getUserBalance(attack 컨트랙트) 함수를 통해 attack 컨트랙트가 가지고 있는 잔액을 확인한다. = 0
      expect(await insecureEtherVault.getUserBalance(attack)).to.be.equal(
        ethers.parseEther('0'),
      );

      // attack 함수를 통해 출금을 요청한다.
      await attack.attack();

      // attack이 가진 잔액을 확인한다. = 45

      expect(await attack.getEtherBalance()).to.be.equal(
        user1DepositAmount + user2DepositAmount,
      );

      // InsecureEtherVault 컨트랙트에 입금된 총 이더를 확인한다. = 0
      expect(await insecureEtherVault.getEtherBalance()).to.be.equal(
        ethers.parseEther('0'),
      );
    });
  });
});
