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
    mapping(address => uint) wavesPerUser;
    uint totalWaves; // Automatically initialized to 0

    constructor() {
        console.log("WavePortal contract constructed.");
    }


    function wave(string memory _message) public {
        totalWaves+=1;
        wavesPerUser[msg.sender] += 1;
        console.log("%s has waved with message %s", msg.sender, _message);

        waves.push(Wave(msg.sender, block.timestamp, _message));
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getWavesForSender() public view returns (uint256) {
        return wavesPerUser[msg.sender];
    }

}