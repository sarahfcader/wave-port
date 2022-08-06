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

    constructor() payable {
        console.log("WavePortal contract constructed.");
    }

    function wave(string memory _message) public {
        totalWaves+=1;
        wavesPerUser[msg.sender] += 1;

        waves.push(Wave(msg.sender, block.timestamp, _message));
        emit NewWave(msg.sender, block.timestamp, _message);

        console.log("%s waved.", msg.sender);

        uint256 prizeAmount = 0.0001 ether;
        require(
            prizeAmount <= address(this).balance,
            "Trying to withdraw more money than the contract has."
        );
        /*require (
            wavesPerUser[msg.sender] < 1,
            "This wallet has already receieved a prize for waving!"
        );*/
        (bool success, ) = (msg.sender).call{value: prizeAmount}(""); //Sending money
        require(success, "Failed to send ETH.");
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