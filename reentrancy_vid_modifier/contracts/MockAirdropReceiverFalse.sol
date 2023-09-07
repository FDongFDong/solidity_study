// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "./Dependencies.sol";
import "./InsecureAirdrop.sol";

contract MockAirdropReceiverFalse is IAirdropReceiver{
    function canReceiveAirdrop() external pure override returns (bool){
        return false;
    }
    function triggerReceiveAirdrop(address insecureAirdropAddress) public {
        InsecureAirdrop(insecureAirdropAddress).receiveAirdrop();
    }
}