// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "./Dependencies.sol";
import "./InsecureAirdrop.sol";

contract MockAirdropReceiverTrue is IAirdropReceiver{
    function canReceiveAirdrop() external pure override returns (bool){
        return true;
    }
    function triggerReceiveAirdrop(address insecureAirdropAddress) public {
        InsecureAirdrop(insecureAirdropAddress).receiveAirdrop();
    }
}