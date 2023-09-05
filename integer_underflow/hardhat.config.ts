import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.6.12',
  networks: {
    dev: {
      url: 'http://localhost:8545',
    },
  },
};

export default config;
