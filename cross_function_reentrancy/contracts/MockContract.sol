// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./InsecureEtherVault.sol";
import "./FixedEtherVault.sol";

contract MockContract{
    enum ContractType {Insecure, Fixed}
    InsecureEtherVault public  insecureEtherVault;
    FixedEtherVault public  fixedEtherVault;
    ContractType public contractType;

    constructor(string memory _type, address _etherVaultAddress) {
        if(keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("insecure"))){
            contractType = ContractType.Insecure;
            insecureEtherVault = InsecureEtherVault(_etherVaultAddress);
        }else if(keccak256(abi.encodePacked(_type))== keccak256(abi.encodePacked("fixed"))){
            contractType = ContractType.Fixed;
            fixedEtherVault = FixedEtherVault(_etherVaultAddress);
        }else{
            revert("Invalid contract Type");
        }
    }

    function attack() external {
        if(ContractType.Insecure == contractType){
            insecureEtherVault.withdrawAll();   
        }else{
            fixedEtherVault.withdrawAll();
        }
    }


    // fallback() external payable {
    //     if(address(vault).balance >= 1 ether){
    //         vault.withdrawAll();
    //     }
    // }
    // receive() external payable{

    // }
    
}