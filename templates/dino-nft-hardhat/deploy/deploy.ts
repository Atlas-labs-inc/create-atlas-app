import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import axios from "axios";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the DinoNFT contract`);

  // Initialize the wallet.
  // @ts-ignore
  const wallet = new Wallet(hre.config.zkSyncDeploy.account);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const DINO_NFT = "DinoNFT";
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("DinoNFT");

  // Deposit some funds to L2 in order to be able to perform L2 transactions.
  const depositAmount = ethers.utils.parseEther("0.001");
  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: depositAmount,
  });
  // Wait until the deposit is processed on zkSync
  await depositHandle.wait();
  
  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const greeterContract = await deployer.deploy(artifact);

  // Show the contract info.
  const contractAddress = greeterContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
  axios.post('https://atlaszk.herokuapp.com/blockchain/contract', {
    user_email: 'admin@atlaszk.com',
    rpc_url: hre.config.zkSyncDeploy.zkSyncNetwork,
    contract_name: DINO_NFT,
    contract_address: contractAddress
  })

  // Call the deployed contract.
  const firstNFT = await greeterContract.mint();
  await firstNFT.wait();
  const firstNF = await greeterContract.mint();
  await firstNF.wait();
  const firstN = await greeterContract.mint();
  await firstN.wait();

  const nft_metadata = await greeterContract.tokenURI(0);
  console.log(nft_metadata);
}