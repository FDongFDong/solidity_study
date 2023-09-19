import { ethers } from 'hardhat';

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';

describe('Arithmetic', () => {
  const DeployContract = async () => {
    const ArithmeticFactory = await ethers.getContractFactory('Arithmetic');
    const Arithmetic = await ArithmeticFactory.deploy();
    const Signer = await ethers.getSigners();
    return { Arithmetic, Signer };
  };

  describe('add', () => {
    it('overflow로 인해 revert된다.', async () => {
      const { Arithmetic } = await loadFixture(DeployContract);
      await expect(Arithmetic.add(ethers.MaxUint256, ethers.MaxUint256)).to.be
        .reverted;
    });
  });

  describe('sub', () => {
    it('underflow로 인해 revert된다.', async () => {
      const { Arithmetic } = await loadFixture(DeployContract);
      await expect(Arithmetic.subtract(0, 1)).to.be.reverted;
    });
  });

  describe('uncheckedAdd', () => {
    it('uncheckedAdd', async () => {
      // Wrapping behavior
      const { Arithmetic } = await loadFixture(DeployContract);
      const result = await Arithmetic.uncheckedAdd(ethers.MaxUint256, 2);
      expect(result).to.equal(1);
    });
  });

  describe('uncheckedSubtract', () => {
    it('uncheckedSubtract', async () => {
      // Wrapping behavior
      const { Arithmetic } = await loadFixture(DeployContract);
      const result = await Arithmetic.uncheckedSubtract(0, 1);
      expect(result).to.equal(ethers.MaxUint256);
    });
  });
});
