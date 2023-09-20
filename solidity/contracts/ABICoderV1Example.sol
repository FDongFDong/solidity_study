// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract ABICoderV1Example {
    struct Person {
        string name;
        uint age;
    }

    Person[] public people;

    function addPerson(string memory name, uint age) public {
        people.push(Person({name: name, age: age}));
    }

    function getPerson(
        uint index
    ) public view returns (string memory name, uint age) {
        require(index < people.length, "Index out of bounds");
        name = people[index].name;
        age = people[index].age;
    }

    function getPeopleCount() public view returns (uint count) {
        count = people.length;
    }
}
