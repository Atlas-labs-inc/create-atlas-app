#!/usr/bin/env node

import inquirer from 'inquirer';
import * as fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import createDirectoryContents from './createDirectoryContents.js';
import hydrateConfig from './hydrateConfig.js';

const CURR_DIR = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

const CHOICES_MAP = {
  'Create a greeter project': "greeter_example",
  'Create an empty atlas app': "default"
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
    message: 'Private Key (Must have Goerli ETH):',
  },
];

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
