const { expect } = require("chai");
const { utils, Wallet } = require("zksync-web3");
const ethers = require("ethers");
const { HardhatRuntimeEnvironment } = require("hardhat/types");
const { AtlasDeployer } = require("../lib/atlas-deployer");


describe("Greeting", function () {
    const wallet = new Wallet(hre.config.zkSyncDeploy.account);
    // Make sure we're not pushing contracts to Atlas
    const deployer = new AtlasDeployer(hre, wallet, false);
    let greeterContract;
    it("Deploy greeter contract", async function () {
        const artifact = await deployer.loadArtifact("Greeter");
    
        // Deposit some funds to L2 in order to be able to perform L2 transactions.
        const depositAmount = ethers.utils.parseEther("0.001");
        const depositHandle = await deployer.zkWallet.deposit({
            to: deployer.zkWallet.address,
            token: utils.ETH_ADDRESS,
            amount: depositAmount,
        });
        // Wait until the deposit is processed
        await depositHandle.wait();
    
        // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
        // `greeting` is an argument for contract constructor.
        const greeting = "Hello, world!"
        greeterContract = await deployer.deploy(artifact, [greeting]);
        await greeterContract.deployTransaction.wait();
        expect(await greeterContract.greet()).to.equal(greeting);
    });
    it("Set new greeting", async function () {
        const newGreeting = "Hola, mundo!"
        const newGreetingTransaction = await greeterContract.setGreeting(newGreeting);
        await newGreetingTransaction.wait();
        
        expect(await greeterContract.greet()).to.equal(newGreeting);
    });
});
