// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ABICoderV2Example {
    struct Person {
        string name;
        uint age;
    }

    Person[] public people;

    function addPerson(string memory name, uint age) public {
        people.push(Person({name: name, age: age}));
    }

    function getPeople() public view returns (Person[] memory) {
        return people;
    }
}
