import * as fs from 'fs';
const CURR_DIR = process.cwd();

const hydrateConfig = (spawn_path, config_name, private_key, rpc_url, blockchain_slug) => {
    const config_path = `${spawn_path}/${config_name}`;
    const hardhat_config_base = fs.readFileSync(config_path).toString();
    var hardhat_config_modify = hardhat_config_base.replace("$PRIVATE_KEY", private_key);
    hardhat_config_modify = hardhat_config_modify.replace("$ATLAS_HTTP_RPC", rpc_url);
    hardhat_config_modify = hardhat_config_modify.replace("$ATLAS_BLOCKCHAIN_SLUG", blockchain_slug);
    fs.writeFileSync(config_path, hardhat_config_modify);
};

export default hydrateConfig;
