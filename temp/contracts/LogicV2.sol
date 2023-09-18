// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./LogicV1.sol";
contract LogicV2 is LogicV1{

    uint256 public newFeature;
        
    function setNewFeature(uint256 _value) public {
        newFeature = _value;
    }
}