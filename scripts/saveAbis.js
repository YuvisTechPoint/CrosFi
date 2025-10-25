const fs = require('fs');
const path = require('path');

// Contract artifacts directory
const artifactsDir = './artifacts/contracts';

// Output directory
const outputDir = './lib/contracts/abis';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Contract names to extract ABIs for
const contracts = [
  'MultiTokenVault',
  'MentoYieldStrategy'
];

console.log('📄 Extracting contract ABIs...');

contracts.forEach(contractName => {
  try {
    // Define the possible paths for each contract
    let contractPath;
    
    if (contractName === 'MultiTokenVault') {
      contractPath = path.join(artifactsDir, 'vault', contractName + '.sol', contractName + '.json');
    } else if (contractName === 'MentoYieldStrategy') {
      contractPath = path.join(artifactsDir, 'strategies', contractName + '.sol', contractName + '.json');
    } else {
      // Fallback to original path structure
      contractPath = path.join(artifactsDir, contractName + '.sol', contractName + '.json');
    }
    
    if (fs.existsSync(contractPath)) {
      const artifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      const abi = artifact.abi;
      
      // Save ABI to output directory
      const outputPath = path.join(outputDir, contractName + '.json');
      fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
      
      console.log(`✅ ${contractName} ABI saved to ${outputPath}`);
    } else {
      console.log(`⚠️  Contract artifact not found: ${contractPath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${contractName}:`, error.message);
  }
});

console.log('🎉 ABI extraction completed!');