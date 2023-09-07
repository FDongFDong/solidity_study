// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./FixedEtherVault.sol";

contract MockSafeMath {
    using SafeMath for uint256;

    function mockAdd(uint256 a, uint256 b) public pure returns (uint256) {
        return a.add(b);
    }
}
