// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


contract LogicV1 {
    uint256 public number;
    
    function setNumber(uint256 _number) public {
        number = _number;
    }
}
