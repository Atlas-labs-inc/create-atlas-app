#!/usr/bin/env node

import inquirer from 'inquirer';
import { exec } from 'child_process';
import * as fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import createDirectoryContents from './createDirectoryContents.js';
import hydrateConfig from './hydrateConfig.js';
import chalk from "chalk";
import open from 'open';
import express from "express";
import jwt_decode from "jwt-decode";
import {
  createHttpTerminator,
} from 'http-terminator';
import getPort from 'get-port';
import ora from "ora";
import netrc from 'node-netrc';
import axios from "axios";
import qs from "qs";
import * as ethers from 'ethers';

const CURR_DIR = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

const CHOICES_MAP = {
  'Create a greeter project': "greeter_example"
  //'Create an empty atlas app': "default",
  //"Create an NFT project": 'dino-nft-hardhat'
}
const ATLAS_ASCII_LOGO = String.raw`
          _____                _____                    _____            _____                    _____          
         /\    \              /\    \                  /\    \          /\    \                  /\    \         
        /::\    \            /::\    \                /::\____\        /::\    \                /::\    \        
       /::::\    \           \:::\    \              /:::/    /       /::::\    \              /::::\    \       
      /::::::\    \           \:::\    \            /:::/    /       /::::::\    \            /::::::\    \      
     /:::/\:::\    \           \:::\    \          /:::/    /       /:::/\:::\    \          /:::/\:::\    \     
    /:::/__\:::\    \           \:::\    \        /:::/    /       /:::/__\:::\    \        /:::/__\:::\    \    
   /::::\   \:::\    \          /::::\    \      /:::/    /       /::::\   \:::\    \       \:::\   \:::\    \   
  /::::::\   \:::\    \        /::::::\    \    /:::/    /       /::::::\   \:::\    \    ___\:::\   \:::\    \  
 /:::/\:::\   \:::\    \      /:::/\:::\    \  /:::/    /       /:::/\:::\   \:::\    \  /\   \:::\   \:::\    \ 
/:::/  \:::\   \:::\____\    /:::/  \:::\____\/:::/____/       /:::/  \:::\   \:::\____\/::\   \:::\   \:::\____\
\::/    \:::\  /:::/    /   /:::/    \::/    /\:::\    \       \::/    \:::\  /:::/    /\:::\   \:::\   \::/    /
 \/____/ \:::\/:::/    /   /:::/    / \/____/  \:::\    \       \/____/ \:::\/:::/    /  \:::\   \:::\   \/____/ 
          \::::::/    /   /:::/    /            \:::\    \               \::::::/    /    \:::\   \:::\    \     
           \::::/    /   /:::/    /              \:::\    \               \::::/    /      \:::\   \:::\____\    
           /:::/    /    \::/    /                \:::\    \              /:::/    /        \:::\  /:::/    /    
          /:::/    /      \/____/                  \:::\    \            /:::/    /          \:::\/:::/    /     
         /:::/    /                                 \:::\    \          /:::/    /            \::::::/    /      
        /:::/    /                                   \:::\____\        /:::/    /              \::::/    /       
        \::/    /                                     \::/    /        \::/    /                \::/    /        
         \/____/                                       \/____/          \/____/                  \/____/         
                                                                                                                 
`;
const CONFIG_FILENAME = "hardhat.config.ts";
const API_BASE = "https://api.atlaszk.com"

let blockchain_cache = {};

const getUserBlockchainChoices = async () => {
  const auth = netrc('atlaszk.com');
  const token = auth.password;
  const response = await axios.get(`${API_BASE}/cli/blockchains`, {
    headers: {
    'Authorization': `Bearer ${token}`
  }});
  blockchain_cache = response.data.data;
  let output = []
  if(response.data.status == "success"){
    const chain_data = response.data.data;
    for (const chain of chain_data) {
      if(chain.status === "Online" || chain.status === "Restarting") {
        output.push(chain.name)
      }
    }
  }
  return output;
}

const blockchainNametoSlug = (name) => {
  return name.toLowerCase().replace(/ /g, "-");
}

const getRPCFromCache = (slug) => {
  for (const chain of blockchain_cache){
    if(chain.slug === slug) {
      return chain.rpcUrl;
    }
  }
}

const validateToken = async () => {
  try {
    const auth = netrc('atlaszk.com');
    const token = auth.password;
    const response = await axios.get(`${API_BASE}/cli/validate`, {
      headers: {
      'Authorization': `Bearer ${token}`
    }});
    if(response.data.status != "success"){
      throw new Error("Invalid status");
    }
  }
  catch {
    console.log(chalk.red("Could not validate login details, retry login?"));
    process.exit();
  }
}


const checkBalance = (address, spinner) => {
  const provider = new ethers.providers.JsonRpcProvider('https://testnet.atlaszk.com');
  let balance = null;
  let ethBalance = null;
  const checkBalanceInterval = setInterval(() => {
    provider.getBalance(address).then((res) => {
      balance = res;
      ethBalance = ethers.utils.formatEther(balance);
      if (parseFloat(ethBalance) >= 1) {
		if (spinner != undefined) {
			spinner.succeed("Funds received, Happy Hacking!");
		}
        clearInterval(checkBalanceInterval);
      }
    });
  }, 1000);
}

const requestFundedAccount = async (address) => {
  // Generate a new wallet
  try {
    const auth = netrc('atlaszk.com');
    const token = auth.password;
    
	
	const response = await axios.post(`${API_BASE}/cli/faucet`, null, {
	  params: {
		address: address,
	  },
	  headers: {
		'Authorization': `Bearer ${token}`
	  }
	});


    if(response.data.status != "success"){
      throw new Error("Failed to fund account");
    }
  }
  catch(e) {
    console.log(chalk.red("Failed to fund account, please notify the Atlas team if this issue persists."));
  }
}

if(process.argv[2] === "login") {
  if(process.argv[3] === "-i") {	
	  inquirer.prompt([
	  {
		type: 'input',
		name: 'username',
		message: 'Email'
	  },
	  {
		type: 'password',
		name: 'password',
		mask: '*',
		message: 'Password'
	  },
	  ]).then(answers => {
			const BASE_LOGIN_URL = `${API_BASE}/auth/cli/login`;
			const data = qs.stringify({
			  'username': answers.username,
			  'password': answers.password,
			  'interactive': 'true',
			});
			const config = {
			  method: 'post',
			  url: BASE_LOGIN_URL,
			  headers: { 
				'Content-Type': 'application/x-www-form-urlencoded'
			  },
			  data : data
			};
			axios(config)
			  .then( response => {
				netrc.update('atlaszk.com', {
					login: answers.username,
					password: response.data.token
				}); 
			  console.log(`${chalk.green("✔")} Logged in as ${chalk.green(answers.username)}`);
			})		  
			  .catch(function (error) {
				
			  console.log(`${chalk.red("Login failed, retry?")}`);
		    });

	});
  }
  else {
	  const BASE_LOGIN_URL = "https://app.atlaszk.com/cli/login";
	  const app = express();
	  app.get('/cli', (req, res) => {
		const token = req.query.token;
		const decoded = jwt_decode(token);
		if(decoded.type != "cli") {
		  console.log(chalk.red("Invalid token type"));
		  throw new Error();
		}
		if(decoded.sub === undefined) {
		  console.log(chalk.red("Login failed"));
		  throw new Error();
		}
		res.send({"status": true});

		netrc.update('atlaszk.com', {
		  login: decoded.sub,
		  password: token
		});

		spinner.succeed("Logged in as " + chalk.green(decoded.sub));
		httpTerminator.terminate().then(() => {
		  process.exit();
		});
	  });
	  
	  const port = await getPort();
	  const user_url = BASE_LOGIN_URL + "?cli_port=" + port;
	  console.log("Opening browser to", chalk.green(user_url));
	  open(user_url);
	  const spinner = ora('Waiting for login').start();
	  const server = app.listen(port);
	  const httpTerminator = createHttpTerminator({
		server,
	  });
  }
} else if(process.argv[2] === "deploy") {  
  await validateToken();
  const compile_cmd = 'npx hardhat compile';
  const deploy_cmd = 'npx hardhat deploy-zksync';
  console.log(chalk.blue("Compiling..."));
  var mainProcess = exec(compile_cmd);
  mainProcess.stdout.on('data', function(data) {
    console.log(data); 
  });

  mainProcess.stderr.on('data', function(data) {
    console.log(data);
  });

  mainProcess.on('exit', function(code) {
    if(code != 0){
      console.log(chalk.red("Compilation failed."));
      process.exit();
    }
    
    console.log(chalk.blue("Deploying..."));

    // Deploy
    var deployProcess = exec(deploy_cmd);
    deployProcess.stdout.on('data', function(data) {
      console.log(data); 
    });

    deployProcess.stderr.on('data', function(data) {
      console.log(data);
    });

    deployProcess.on('exit', function(dcode) {
      if(dcode != 0){
        console.log(chalk.red("Deployment failed."));
        process.exit();
      }
    });
  });



} else if(process.argv[2] === "new"){
  await validateToken();
  const projectDevWallet = ethers.Wallet.createRandom();
  await requestFundedAccount(projectDevWallet.address);
	
  const QUESTIONS = [
    {
      name: 'project-choice',
      type: 'list',
      message: `${ATLAS_ASCII_LOGO}\n\nWhat do you want do?`,
      choices: Object.keys(CHOICES_MAP),
    },
    {
      name: 'project-name',
      type: 'input',
      message: 'Project name:',
      validate: function (input) {
        if (/^([A-Za-z\-\\_\d])+$/.test(input)) return true;
        else return 'Project name may only include letters, numbers, underscores and hashes.';
      },
    },
    {
      name: 'project-slug',
      type: 'list',
      message: `Choose a blockchain (create one -> https://app.atlaszk.com/create):`,
      choices: await getUserBlockchainChoices(),
    },
  ];
  inquirer.prompt(QUESTIONS).then(answers => {
    const projectChoice = CHOICES_MAP[answers['project-choice']];
    const projectName = answers['project-name'];
    const projectBlockchainSlug = blockchainNametoSlug(answers['project-slug']);
    const projectRPCURL = getRPCFromCache(projectBlockchainSlug);

    const templatePath = `${__dirname}/templates/${projectChoice}`;
    const spawn_path = `${CURR_DIR}/${projectName}`;

    fs.mkdirSync(spawn_path);

    createDirectoryContents(templatePath, projectName);
    
    hydrateConfig(spawn_path, CONFIG_FILENAME, projectDevWallet.privateKey, projectRPCURL, projectBlockchainSlug);

	const spinner = ora('Requesting funds from faucet').start();
	checkBalance(projectDevWallet.address, spinner);
	
  });
} else if(process.argv[2] === "test"){
  await validateToken();
  const test_cmd = 'npx hardhat test';
  console.log(chalk.blue("Running tests..."));
  var mainProcess = exec(test_cmd);
  mainProcess.stdout.on('data', function(data) {
    console.log(data); 
  });

  mainProcess.stderr.on('data', function(data) {
    console.log(data);
  });

  mainProcess.on('exit', function(code) {
    if(code != 0){
      console.log(chalk.red("Tests failed."));
      process.exit();
    }
  });
}
else {
  console.log("Invalid command...")
}
