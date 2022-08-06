
//Using hardhat-ethers, plugin integration with ethers.js library
// hre = Hardhat Runtime Environment = object containing all functionality 
// exposed by hardhat when running a task/test/script
// Using `npx hardhat` builds hre object using hardhat.config.js

const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    // Compile contract, generate files in artifacts
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    // Hardhat creates local Ethereum network ('fresh blockchain') (later destroyed)
    // Removes ETH from my wallet to fund the contract
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
      });
    // constructor runs after contract is deployed
    await waveContract.deployed();

    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract deployed by:", owner.address);

    // Constructor
    let waveCount;
    waveCount = await waveContract.getTotalWaves(); // return value (fulfilled value of promise) = await expression
    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Total waves: ", waveCount.toNumber());
    console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance));

    // Message wave
    let waveTxn = await waveContract.wave("Hello I am message");
    await waveTxn.wait();
    waveTxn = await waveContract.connect(randomPerson).wave("I AM ALSO MESSAGE");
    await waveTxn.wait();
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance));

    // Get waves for senders
    let wavesForSender;
    wavesForSender = await waveContract.getWavesForSender();
    console.log(owner.address," has waved ", wavesForSender.toNumber(), " times.");
    wavesForSender = await waveContract.connect(randomPerson).getWavesForSender();
    console.log(randomPerson.address," has waved ", wavesForSender.toNumber(), " times.");

    // Total waves
    let allWaves = await waveContract.getAllWaves();
    waveCount = await waveContract.getTotalWaves();

    console.log("Total waves: ", waveCount.toNumber());
    console.log(allWaves);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1); //Exit with error message
    }
};

runMain();