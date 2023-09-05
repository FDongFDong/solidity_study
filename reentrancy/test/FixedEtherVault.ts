import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  Signer,
  ContractTransactionResponse,
  ContractTransactionReceipt,
} from 'ethers';
import { FixedEtherVault, FailingReceiver } from '../typechain-types';
describe('FixedEtherVault', () => {
  const deployFixedEtherVault = async () => {
    const Signer = await ethers.getSigners();
    const FixedEtherVaultContract =
      await ethers.getContractFactory('FixedEtherVault');
    const FixedEtherVault = await FixedEtherVaultContract.deploy();
    return { Signer, FixedEtherVault };
  };
  let fixedEtherVault: FixedEtherVault;
  let signer: Signer[];

  before(async () => {
    const { FixedEtherVault, Signer } = await loadFixture(
      deployFixedEtherVault,
    );
    fixedEtherVault = FixedEtherVault;
    signer = Signer;
  });

  describe('Constructor', () => {
    it('');
  });
  describe('입금', () => {
    const depositAmount = ethers.parseEther('1.0');
    it('입금할 수 있다.', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );
      fixedEtherVault = FixedEtherVault;
      signer = Signer;

      await fixedEtherVault
        .connect(signer[1])
        .deposit({ value: depositAmount });
      const contractAmount = await fixedEtherVault.getUserBalance(signer[1]);
      expect(contractAmount).to.be.equal(depositAmount);
    });
  });
  describe('출금', () => {
    let totalGas: bigint = BigInt('0');
    const calculateTotalGas = async (
      tx: ContractTransactionResponse,
    ): Promise<bigint> => {
      const receipt: ContractTransactionReceipt | null = await tx.wait();
      const gasUsed: bigint | undefined = receipt?.gasUsed;
      if (gasUsed) {
        totalGas += gasUsed + tx.gasPrice;
        console.log(totalGas);
      }
      return totalGas;
    };

    const depositAmount = ethers.parseEther('10.0');
    it('모든 잔액을 출금할 수 있다.', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );
      fixedEtherVault = FixedEtherVault;
      signer = Signer;
      await fixedEtherVault
        .connect(signer[1])
        .deposit({ value: depositAmount });

      expect(await fixedEtherVault.getBalance()).to.be.equal(depositAmount);
      expect(await fixedEtherVault.getUserBalance(signer[1])).to.equal(
        depositAmount,
      );

      await fixedEtherVault.connect(signer[1]).withdrawAll();

      expect(await fixedEtherVault.getBalance()).to.be.equal(0);
      expect(await fixedEtherVault.getUserBalance(signer[1])).to.be.equal(0);
    });

    it('사용자가 자금이 부족한 상태에서 출금을 시도할 때 실패한다.', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );
      fixedEtherVault = FixedEtherVault;
      signer = Signer;
      await expect(
        fixedEtherVault.connect(signer[1]).withdrawAll(),
      ).to.be.revertedWith('Insufficient balance');
    });
    it('호출한 주소에서 이더를 수신하는데 실패하면 revert된다.', async () => {
      const FailingReceiver =
        await ethers.getContractFactory('FailingReceiver');
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );
      fixedEtherVault = FixedEtherVault;
      signer = Signer;

      const fixedEtherVaultAddress = await fixedEtherVault.getAddress();

      let failingReceiver: FailingReceiver = await FailingReceiver.deploy(
        'fixed',
        fixedEtherVaultAddress,
      );
      await failingReceiver.setShouldFailOnReceive(true);
      await expect(
        failingReceiver
          .connect(signer[1])
          .depositAndWithdraw({ value: ethers.parseEther('0.5') }),
      ).to.be.revertedWith('Failed to send Ether');
    });
    
  });
  describe('잔고 확인', () => {
    const depositAmount = ethers.parseEther('10.0');
    it('특정 Address의 잔고를 확인할 수 있다.', async () => {
      const { FixedEtherVault, Signer } = await loadFixture(
        deployFixedEtherVault,
      );
      fixedEtherVault = FixedEtherVault;
      signer = Signer;
      await fixedEtherVault
        .connect(signer[1])
        .deposit({ value: depositAmount });
      const balance = await fixedEtherVault.getBalance();
      expect(balance).to.be.equal(depositAmount);
    });
  });
});
