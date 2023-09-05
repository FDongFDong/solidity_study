import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-web3';
const config: HardhatUserConfig = {
  solidity: '0.8.13',
  networks: {
    dev: {
      url: 'http://localhost:8545',
    },
  },
};

export default config;
