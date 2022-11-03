#!/usr/bin/env node

import inquirer from 'inquirer';
import { exec } from 'child_process';
import * as fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import createDirectoryContents from './createDirectoryContents.js';
import hydrateConfig from './hydrateConfig.js';
import chalk from "chalk";

const CURR_DIR = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

const CHOICES_MAP = {
  'Create a greeter project': "greeter_example",
  'Create an empty atlas app': "default",
  "Create an NFT project": 'dino-nft-hardhat'
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
    name: 'project-rpc-url',
    type: 'input',
    message: 'RPC URL:',
  },
  {
    name: 'project-deployment-key',
    type: 'input',
    message: 'Private Key (Must have Sepolia ETH):',
  },
];

if(process.argv[2] === "deploy") {  
  const compile_cmd = 'yarn hardhat compile';
  const deploy_cmd = 'yarn hardhat deploy-zksync';
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
  inquirer.prompt(QUESTIONS).then(answers => {
    const projectChoice = CHOICES_MAP[answers['project-choice']];
    const projectName = answers['project-name'];
    const projectPrivateKey = answers['project-deployment-key'];
    const projectRPCURL = answers['project-rpc-url'];

    const templatePath = `${__dirname}/templates/${projectChoice}`;
    const spawn_path = `${CURR_DIR}/${projectName}`;

    fs.mkdirSync(spawn_path);

    createDirectoryContents(templatePath, projectName);
    
    hydrateConfig(spawn_path, CONFIG_FILENAME, projectPrivateKey, projectRPCURL);

  });
}
else {
  console.log("No command specified...")
}
