// SPDX-License-Identifier: BSL-1.0 (Boost Software License 1.0)

//-------------------------------------------------------------------------------------//
// Copyright (c) 2022 - 2023 serial-coder: Phuwanai Thummavet (mr.thummavet@gmail.com) //
//-------------------------------------------------------------------------------------//

// For more info, please refer to my article:
//  - On Medium: https://medium.com/valixconsulting/solidity-smart-contract-security-by-example-02-reentrancy-b0c08cfcd555
//  - On serial-coder.com: https://www.serial-coder.com/post/solidity-smart-contract-security-by-example-02-reentrancy/

pragma solidity 0.8.13;

abstract contract ReentrancyGuard {
    bool internal locked;

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }
}

contract FixedEtherVault is ReentrancyGuard {
    mapping (address => uint256) private userBalances;

    function deposit() external payable {
        userBalances[msg.sender] += msg.value;
    }

    function withdrawAll() external noReentrant {  // FIX: Apply mutex lock
        uint256 balance = getUserBalance(msg.sender);
        require(balance > 0, "Insufficient balance");  // Check

        // FIX: Apply checks-effects-interactions pattern
        userBalances[msg.sender] = 0;  // Effect

        (bool success, ) = msg.sender.call{value: balance}("");  // Interaction
        require(success, "Failed to send Ether");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserBalance(address _user) public view returns (uint256) {
        return userBalances[_user];
    }
}
