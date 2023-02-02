const { ethers } = require("hardhat");
const { etherscan } = require("../hardhat.config");
const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
    const accounts = await ethers.getSigners();
    
    const { chainId } = await ethers.provider.getNetwork()
    console.log("Using chainId:", chainId)

    // Fetched deployed tokens
    const Anchor = await ethers.getContractAt('Token', config[chainId].Anchor.address)
    console.log(`Anchor Token fetched: ${Anchor.address}\n`)
    
    const aETH = await ethers.getContractAt('Token', config[chainId].aETH.address)
    console.log(`aETH Token fetched: ${aETH.address}\n`)
    
    const aDAI = await ethers.getContractAt('Token', config[chainId].aDAI.address)
    console.log(`aDAI Token fetched: ${aDAI.address}\n`)

    // Fetch the deployed exchange
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange fetched: ${exchange.address}\n`)

    // Give tokens to account[1]
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(10000)

    // user1 transfers 10,000 aETH
    let transaction, result;
    transaction = await aETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

    // Set up exchange users
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000)
    
    // user1 approves 10,000 Anchor Token...
    transaction = await Anchor.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}`)

    // user1 deposits 10,000 Anchor Token...
    transaction = await exchange.connect(user1).depositToken(Anchor.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`)
    
    // user2 approves 10,000 aETH...
    transaction = await aETH.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address}`)

    // user2 deposits 10,000 aETH...
    transaction = await exchange.connect(user2).depositToken(aETH.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user2.address}\n`)
    
    /////////////////////////////////////////////////
    // Seed a Cancelled Order

    // User 1 makes order to get tokens
    let orderId
    transaction = await exchange.connect(user1).makeOrder(aETH.address, tokens(100), Anchor.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)

    // Wait 1 second
    await wait(1)

    /////////////////////////////////////////////////////////////
    // Seed Filled Orders

    // User 1 makes order
    transaction = await exchange.connect(user1).makeOrder(aETH.address, tokens(100), Anchor.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // Fill orders
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    // Wait 1 second
    await wait(1)

    // User 1 makes another order
    transaction = await exchange.makeOrder(aETH.address, tokens(50), Anchor.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // User 2 fills another order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    // Wait 1 second
    await wait(1)

    // User 1 makes final order
    transaction = await exchange.connect(user1).makeOrder(aETH.address, tokens(200), Anchor.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // User 2 fills final order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    // Wait 1 second
    await wait(1)

    ////////////////////////////////////////////////////////
    // Seed Open Orders
    
    // User 1 makes 10 orders
    for(let i=1; i<= 10; i++){
        transaction = await exchange.connect(user1).makeOrder(aETH.address, tokens(10 * i), Anchor.address, tokens(10))
        result = await transaction.wait()
        console.log(`Made order from ${user1.address}`)

        // Wait 1 second
        await wait(1)
    }
    // User 2 makes 10 orders
    for(let i=1; i<= 10; i++){
        transaction = await exchange.connect(user2).makeOrder(Anchor.address, tokens(10), aETH.address, tokens(10 * i))
        result = await transaction.wait()
        console.log(`Made order from ${user2.address}`)
    
        // Wait 1 second
        await wait(1)
    }
 }


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
