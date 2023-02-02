const { ethers } = require("hardhat");
const { etherscan } = require("../hardhat.config");

async function main() {
    console.log("Preparing deployment...\n");
    // Fetch Contract to deploy
    const Token = await ethers.getContractFactory("Token");
    const Exchange = await ethers.getContractFactory("Exchange");

    // Fetch accounts
    const accounts = await ethers.getSigners()
    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts
    [1].address}\n`)
    // Deploy Contract
    const anchor = await Token.deploy('Anchor Token', 'ACTN', '10000000');
    // get the token info that is currently deployed
    await anchor.deployed();
    console.log(`Anchor Token Deployed to: ${anchor.address}`);

    const aETH = await Token.deploy('aETH', 'aETH', '10000000');
    await aETH.deployed();
    console.log(`aETH Deployed to: ${aETH.address}`);

    const aDAI = await Token.deploy('aDAI', 'aDAI', '10000000');
    await aDAI.deployed();
    console.log(`aDAI Deployed to: ${aDAI.address}`);

    const exchange = await Exchange.deploy(accounts[1].address, 10);
    await exchange.deployed();
    console.log(`exchange Deployed to: ${exchange.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})