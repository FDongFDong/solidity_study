# 알게된 사실

## block tiemstamp 변경하는 방법

https://ethereum.stackexchange.com/questions/86633/time-dependent-tests-with-hardhat

```solidity
ethers.provider.send('evm_increaseTime', [40000]);
ethers.provider.send('evm_mine');
```

## 빈 지갑 만드는 방법

```solidity
    const randomWallet = Wallet.createRandom().connect(ethers.provider);
```
