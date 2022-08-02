
//Using hardhat-ethers, plugin integration with ethers.js library
// hre = Hardhat Runtime Environment = object containing all functionality 
// exposed by hardhat when running a task/test/script
// Using `npx hardhat` builds hre object using hardhat.config.js

const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    // Compile contract, generate files in artifacts
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    // Hardhat creates local Ethereum network ('fresh blockchain') (later destroyed)
    const waveContract = await waveContractFactory.deploy();
    // constructor runs after contract is deployed
    await waveContract.deployed();

    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract deployed by:", owner.address);

    let waveCount;
    wavecount = await waveContract.getTotalWaves();
    // return value (fulfilled value of promise) = await expression

    let waveTxn = await waveContract.waveAtPortal();
    await waveTxn.wait();

    waveCount = await waveContract.getTotalWaves();
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        process.exit(1); //Exit with error message
    }
};

runMain();