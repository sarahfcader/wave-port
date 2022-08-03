// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0; //version+= of solidity compiler contract uses, matches config file

import "hardhat/console.sol"; //allows console logs


contract WavePortal {
    uint totalWaves; // Automatically initialized to 0
    mapping(address => uint) wavesPerUser;

    constructor() {
        console.log("WavePortal contract constructed.");
    }

    function wave() public {
        totalWaves+=1;

        // Increment waves for msg.sender
        wavesPerUser[msg.sender] += 1;
        console.log("%s has waved!", msg.sender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("I've been waved at %d time(s).", totalWaves);
        return totalWaves;
    }

    function getWavesForSender() public view returns (uint256) {
        console.log("%s has waved %d time(s)!", msg.sender, wavesPerUser[msg.sender]);
        return wavesPerUser[msg.sender];
    }

}