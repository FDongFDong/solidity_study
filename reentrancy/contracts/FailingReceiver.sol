
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./InsecureEtherVault.sol";

contract FailingReceiver {
    InsecureEtherVault public insecureEtherVault;

    constructor(address _insecureEtherVault){
        insecureEtherVault = InsecureEtherVault(_insecureEtherVault);
    }

    function depositAndWithdraw() public payable {
        insecureEtherVault.deposit{value : msg.value}();
        insecureEtherVault.withdrawAll();
    }


    receive() external payable{
        revert("I do not accept Ether");
    }


}