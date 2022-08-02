// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0; //version+= of solidity compiler contract uses, matches config file

import "hardhat/console.sol"; //allows console logs


contract WavePortal {
    uint totalWaves; // Automatically initialized to 0
    mapping(address => uint) wavesPerUser;

    constructor() {
        console.log("WavePortal contract constructed.");
    }

    function waveAtPortal() public {
        totalWaves++;

        // Increment waves for msg.sender
        uint wavesForSender = wavesPerUser[msg.sender];
        wavesForSender++;
        wavesPerUser[msg.sender] = wavesForSender;

        console.log("%s has waved! They've waved %d time(s).", msg.sender, wavesForSender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("I've been waved at %d times.", totalWaves);
        return totalWaves;
    }

}