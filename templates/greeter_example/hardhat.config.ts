require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");

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
    zkSyncNetwork: "http://ec2-184-72-69-110.compute-1.amazonaws.com:3050",
    ethNetwork: "goerli", // Can also be the RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
    account: "0xa86daed2bb5341cba34fd9c786bf09ec57e9e6b8d4f1428704ed428020d582e3"
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