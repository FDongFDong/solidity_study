
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./InsecureEtherVault.sol";
import "./FixedEtherVault.sol";

contract FailingReceiver {
    enum ContractType {Insecure, Fixed}
    InsecureEtherVault public insecureEtherVault;
     FixedEtherVault public fixedEtherVault; 
    ContractType public contractType;

    bool public shouldFailOnReceive = false;


    constructor(string memory _type, address _etherVaultAddress){
        if (keccak256(abi.encodePacked(_type))== keccak256(abi.encodePacked("insecure"))){
            contractType = ContractType.Insecure;
            insecureEtherVault = InsecureEtherVault(_etherVaultAddress);
        }else if(keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("fixed"))){
            contractType = ContractType.Fixed;
            fixedEtherVault = FixedEtherVault(_etherVaultAddress);
        }else{
            revert("Invalid contract Type");
        }
    }

    function depositAndWithdraw() public payable {
        if(ContractType.Insecure == contractType){
            insecureEtherVault.deposit{value : msg.value}();
            insecureEtherVault.withdrawAll();
        }else{
            fixedEtherVault.deposit{value : msg.value}();
            fixedEtherVault.withdrawAll();
        }
        
        
    }

    function setShouldFailOnReceive(bool _shouldFail) public {
        shouldFailOnReceive = _shouldFail;
    }


    receive() external payable{
        if(shouldFailOnReceive){
            revert("I do not accept Ether");
        }else{
            if (address(fixedEtherVault).balance >= 1 ether) {
                fixedEtherVault.withdrawAll();
            }
        }
    }


}