/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  DeployContractOptions,
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomicfoundation/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "Attack",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Attack__factory>;
    getContractFactory(
      name: "IMoonVault",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IMoonVault__factory>;
    getContractFactory(
      name: "IMoonToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IMoonToken__factory>;
    getContractFactory(
      name: "MoonToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.MoonToken__factory>;
    getContractFactory(
      name: "FixedMoonVault",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FixedMoonVault__factory>;
    getContractFactory(
      name: "InsecureMoonVault",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.InsecureMoonVault__factory>;

    getContractAt(
      name: "Attack",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Attack>;
    getContractAt(
      name: "IMoonVault",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IMoonVault>;
    getContractAt(
      name: "IMoonToken",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IMoonToken>;
    getContractAt(
      name: "MoonToken",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.MoonToken>;
    getContractAt(
      name: "FixedMoonVault",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.FixedMoonVault>;
    getContractAt(
      name: "InsecureMoonVault",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.InsecureMoonVault>;

    deployContract(
      name: "Attack",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Attack>;
    deployContract(
      name: "IMoonVault",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IMoonVault>;
    deployContract(
      name: "IMoonToken",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IMoonToken>;
    deployContract(
      name: "MoonToken",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.MoonToken>;
    deployContract(
      name: "FixedMoonVault",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FixedMoonVault>;
    deployContract(
      name: "InsecureMoonVault",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.InsecureMoonVault>;

    deployContract(
      name: "Attack",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Attack>;
    deployContract(
      name: "IMoonVault",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IMoonVault>;
    deployContract(
      name: "IMoonToken",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IMoonToken>;
    deployContract(
      name: "MoonToken",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.MoonToken>;
    deployContract(
      name: "FixedMoonVault",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FixedMoonVault>;
    deployContract(
      name: "InsecureMoonVault",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.InsecureMoonVault>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
  }
}