// import "dotenv/config";
// import "@nomicfoundation/hardhat-ethers";   // <-- indispensable pour avoir hre.ethers

// export default {
//   solidity: {
//     version: "0.8.28",
//     settings: { optimizer: { enabled: true, runs: 200 } },
//   },
//   networks: {
//     sepolia: {
//       type: "http",                        // Hardhat v3
//       url: process.env.INFURA_HTTP,        // https://sepolia.infura.io/v3/...
//       accounts: [process.env.SEPOLIA_PRIVATE_KEY], // commence par 0x
//       chainId: 11155111,
//     },
//   },
// };

// hardhat.config.mjs
import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: "0.8.28",          // suffisant pour le réseau local
};

