// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0; //version+= of solidity compiler contract uses, matches config file

import "hardhat/console.sol"; //allows console logs NO-OPs which cost tiny bit of gas


contract WavePortal {
    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver;
        uint256 timestamp;
        string message;
    }

    Wave[] waves;
    mapping(address => uint256) lastWavedAt; //COOLDOWN address->time mapping
    uint totalWaves; // Automatically initialized to 0
    uint256 private seed; // Random number generation

    constructor() payable {
        console.log("WavePortal contract constructed.");
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function wave(string memory _message) public {
        require (
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30 seconds"
        );

        totalWaves+=1;
        lastWavedAt[msg.sender] = block.timestamp;
        console.log("%s waved.", msg.sender);

        waves.push(Wave(msg.sender, block.timestamp, _message));
        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %d", seed);

        if (seed < 30) { //50-50 chance, not true randomness
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}(""); //Sending money
            require(success, "Failed to send ETH.");
        }

        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }
}