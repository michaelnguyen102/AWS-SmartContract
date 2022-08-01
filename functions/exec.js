const ethers = require('ethers');
const { abis, addresses } = require('../contracts');

async function runTwapUpdate(contract, wallet, label) {
    console.log('Sending transaction...', label);

    try {
    // Specify custom tx overrides, such as gas price https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
    const overrides = { gasPrice: process.env.DEFAULT_GAS_PRICE, gasLimit: process.env.GAS_LIMIT };

    const tx = await contract.update(overrides)
    const successMessage = `Calling update: Transaction sent https://ftmscan.com/tx/${tx.hash}`;
    console.log(label, successMessage)

    } catch (err) {
      const errorMessage = `:warning: Transaction failed: ${err.message}`;
      console.error(errorMessage)
      return err;
    }

}

async function updateMultiChainOracle(contract, contractBsc, label) {
    console.log('Sending transaction...', label);

    try {
    // Specify custom tx overrides, such as gas price https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
    const overrides = { gasPrice: process.env.DEFAULT_GAS_PRICE, gasLimit: process.env.GAS_LIMIT };

    //Run update on FTM Oracle
    const tx = await contract.update(overrides)

    let successMessage = `Calling FTM update func: Transaction sent https://ftmscan.com/tx/${tx.hash}`;
    console.log(label, successMessage)

    //Retrieves updated data from FTM
    const blockTimestampLast = await contract.getBlockTimestampLast(overrides);
    const price0CumulativeLast = await contract.getPrice0CumulativeLast(overrides);
    const price1CumulativeLast = await contract.getPrice1CumulativeLast(overrides);

    successMessage = `Retrieve data...blockTimestampLast: ${blockTimestampLast}, price0CumulativeLast: ${price0CumulativeLast}, price1CumulativeLast:  ${price1CumulativeLast}`;
    console.log(label, successMessage)

    //Update BSC Oracle
     const txBSC = await contractBsc.update(price0CumulativeLast, price1CumulativeLast, blockTimestampLast, overrides)
     successMessage = `Calling BSC update func: Transaction sent https://bscscan.com/tx/${txBSC.hash}`;
    console.log(label, successMessage)


    } catch (err) {
      const errorMessage = `Transaction failed: ${err.message}`;
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
  const UniswapPairOracle_HEC_DAI_BSC_ABI = abis.UniswapPairOracle_HEC_DAI_BSC;
  const UniswapPairOracle_HEC_DAI_BSC_Address = addresses.UniswapPairOracle_HEC_DAI_BSC;
  console.log('Contract ABIs loaded');

  // Initialize Fantom wallet
  const provider = new ethers.providers.JsonRpcProvider(process.env.FTM_RPC_URL);
  let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Initialize BSC wallet
  const providerBSC = new ethers.providers.JsonRpcProvider(process.env.BSC_RPC_URL);
  let walletBSC = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  wallet = wallet.connect(provider)
  console.log('Fantom wallet loaded');

  walletBSC = walletBSC.connect(providerBSC)
  console.log('BSC wallet loaded');

  // Load FTM contract
  const contract_HEC_DAI = new ethers.Contract(
    UniswapPairOracle_HEC_DAI_Address,
    UniswapPairOracle_HEC_DAI_ABI,
    wallet
  )

  console.log('Contract UniswapPairOracle_HEC_DAI loaded');

  const contract_HEC_DAI_BSC = new ethers.Contract(
    UniswapPairOracle_HEC_DAI_BSC_Address,
    UniswapPairOracle_HEC_DAI_BSC_ABI,
    walletBSC
  )

  console.log('Contract UniswapPairOracle_HEC_DAI_BSC loaded');


  // await runTwapUpdate(    
  //   contract_HEC_DAI,
  //   wallet,
  //   'HEC_DAI: ')

  await updateMultiChainOracle(    
    contract_HEC_DAI,
    contract_HEC_DAI_BSC, 
    'updateMultiChainOracle: ')

    

  console.log('Completed');
  return true;
}
