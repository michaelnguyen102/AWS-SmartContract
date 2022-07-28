const ethers = require('ethers');
const { abis, addresses } = require('../contracts');

async function runTwapUpdate(contract, wallet, label) {
    console.log('Sending transaction...', label);

    try {
    // Specify custom tx overrides, such as gas price https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
    const overrides = { gasPrice: process.env.DEFAULT_GAS_PRICE, gasLimit: process.env.GAS_LIMIT };

    const tx = await contract.update(overrides)
    const successMessage = `:white_check_mark: Transaction sent https://ftmscan.com/tx/${tx.hash}`;
    console.log(label, successMessage)

    } catch (err) {
      const errorMessage = `:warning: Transaction failed: ${err.message}`;
      console.error(errorMessage)
      return err;
    }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.handler = async function() {
  console.log('Starting...');
  // Load Contract ABIs


  const UniswapPairOracle_HEC_DAI_ABI = abis.UniswapPairOracle_HEC_DAI;
  const UniswapPairOracle_HEC_DAI_Address = addresses.UniswapPairOracle_HEC_DAI;
  console.log('Contract ABIs loaded');

  // Initialize Ethers wallet
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  wallet = wallet.connect(provider)
  console.log('Ethers wallet loaded');

  // Load contract
  const contract_HEC_DAI = new ethers.Contract(
    UniswapPairOracle_HEC_DAI_Address,
    UniswapPairOracle_HEC_DAI_ABI,
    wallet
  )

  console.log('Contract loaded');

  await runTwapUpdate(    
    contract_HEC_DAI,
    wallet,
    'HEC_DAI: ')

  console.log('Completed');
  return true;
}
