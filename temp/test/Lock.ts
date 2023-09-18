import { ethers, providers } from 'ethers';
import { expect } from 'chai';

describe('Proxy', () => {
  let proxy: ethers.Contract;
  let logicV1: ethers.Contract;
  let logicV2: ethers.Contract;

  beforeEach(async () => {
    const provider = new providers.AlchemyProvider();

    logicV1 = await ethers.ContractFactory('LogicV1').deploy();
    logicV2 = await ethers.ContractFactory('LogicV2').deploy();

    proxy = await ethers.contractFactory('Proxy').deploy();
    await proxy.setLogicContract(logicV1.address);
  });

  it('should forward calls to the logic contract', async () => {
    const tx = await proxy.forwardCall(
      logicV1.methods.setNumber(10).encodeABI()
    );
    await tx.wait();

    expect(logicV1.number).to.equal(10);
  });

  it('should forward calls to the new features of the logic contract', async () => {
    await proxy.setLogicContract(logicV2.address);

    const tx = await proxy.forwardCall(
      logicV2.methods.setNewFeature(20).encodeABI()
    );
    await tx.wait();

    expect(logicV2.newFeature).to.equal(20);
  });
});
