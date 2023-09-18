// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Proxy {

    address public logicContract;
    
    function setLogicContract(address _logicContract) public {
        logicContract = _logicContract;
    }
    
    function forwardCall(bytes memory data) public {
        (bool success,) = logicContract.delegatecall(data);
        require(success, "Call failed");
    }
}
