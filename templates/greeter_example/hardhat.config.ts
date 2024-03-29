require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
require("@nomiclabs/hardhat-waffle");

module.exports = {
  zksolc: {
    version: "1.1.0",
    compilerSource: "docker",
    settings: {
      optimizer: {
        enabled: true,
      },
      experimental: {
        dockerImage: "matterlabs/zksolc",
        tag: "v1.1.0"
      }
    },
  },
  zkSyncDeploy: {
    zkSyncNetwork: "$ATLAS_HTTP_RPC",
    ethNetwork: "https://testnet.atlaszk.com",
	account: "$PRIVATE_KEY",
  },
  atlasConfig: {
    blockchain_slug: "$ATLAS_BLOCKCHAIN_SLUG"
  },
  networks: {
    hardhat: {
      zksync: true,
    },
  },
  solidity: {
    version: "0.8.16",
  },
};
