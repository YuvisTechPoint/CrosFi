import { ethers } from "ethers";

/**
 * Get Ethereum provider - either from MetaMask or fallback to RPC
 */
export function getProvider(): ethers.Provider {
  if (typeof window !== "undefined" && window.ethereum) {
    console.log("Using MetaMask provider");
    return new ethers.BrowserProvider(window.ethereum);
  }
  
  const rpcUrl = process.env.NEXT_PUBLIC_RPC || "http://127.0.0.1:8545";
  console.log("Using RPC provider:", rpcUrl);
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get signer from connected wallet
 */
export async function getSigner(): Promise<ethers.Signer> {
  const provider = getProvider();
  
  if (provider instanceof ethers.BrowserProvider) {
    try {
      const signer = await provider.getSigner();
      console.log("Got signer for address:", await signer.getAddress());
      return signer;
    } catch (error) {
      console.error("Failed to get signer:", error);
      throw new Error("No wallet connected or user rejected connection");
    }
  }
  
  throw new Error("No wallet connected - please connect MetaMask");
}

/**
 * Create contract instance
 */
export function getContract(
  address: string, 
  abi: any, 
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  const provider = signerOrProvider || getProvider();
  const contract = new ethers.Contract(address, abi, provider);
  console.log("Created contract instance for:", address);
  return contract;
}

/**
 * Format BigInt amount to human-readable string
 */
export function formatAmount(value: bigint | string, decimals = 18): string {
  try {
    return ethers.formatUnits(value, decimals);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return "0";
  }
}

/**
 * Parse human-readable string to BigInt
 */
export function parseAmount(value: string, decimals = 18): bigint {
  try {
    return ethers.parseUnits(value, decimals);
  } catch (error) {
    console.error("Error parsing amount:", error);
    throw new Error(`Invalid amount: ${value}`);
  }
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get network name from chain ID
 */
export function getNetworkName(chainId: number): string {
  const networks: { [key: number]: string } = {
    44787: "Celo Alfajores",
    42220: "Celo Mainnet",
    1337: "Hardhat Local",
    31337: "Hardhat Local",
  };
  
  return networks[chainId] || `Chain ${chainId}`;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

/**
 * Request account access from MetaMask
 */
export async function requestAccountAccess(): Promise<string[]> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("Connected accounts:", accounts);
    return accounts;
  } catch (error) {
    console.error("Failed to request accounts:", error);
    throw new Error("User rejected account access");
  }
}

/**
 * Switch to specific network
 */
export async function switchNetwork(chainId: string): Promise<void> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
    console.log("Switched to network:", chainId);
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added, try to add it
      throw new Error("Network not added to MetaMask. Please add it manually.");
    }
    console.error("Failed to switch network:", error);
    throw new Error("Failed to switch network");
  }
}

/**
 * Get current network chain ID
 */
export async function getCurrentChainId(): Promise<number> {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return Number(network.chainId);
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string, 
  confirmations = 1
): Promise<ethers.TransactionReceipt> {
  const provider = getProvider();
  console.log("Waiting for transaction confirmation:", txHash);
  
  const receipt = await provider.waitForTransaction(txHash, confirmations);
  console.log("Transaction confirmed:", receipt);
  
  return receipt;
}

/**
 * Estimate gas for transaction
 */
export async function estimateGas(
  contract: ethers.Contract,
  method: string,
  ...args: any[]
): Promise<bigint> {
  try {
    const gasEstimate = await contract[method].estimateGas(...args);
    console.log(`Gas estimate for ${method}:`, gasEstimate.toString());
    return gasEstimate;
  } catch (error) {
    console.error(`Gas estimation failed for ${method}:`, error);
    throw new Error("Gas estimation failed");
  }
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, chainId?: number): string {
  const currentChainId = chainId || 44787; // Default to Alfajores
  
  const explorers: { [key: number]: string } = {
    44787: "https://alfajores.celoscan.io/tx/",
    42220: "https://celoscan.io/tx/",
    1337: "#",
    31337: "#",
  };
  
  const baseUrl = explorers[currentChainId] || explorers[44787];
  return `${baseUrl}${txHash}`;
}

/**
 * Format error message for user display
 */
export function formatError(error: any): string {
  if (error?.message) {
    // Common MetaMask errors
    if (error.message.includes("User rejected")) {
      return "Transaction was cancelled by user";
    }
    if (error.message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    if (error.message.includes("gas required exceeds allowance")) {
      return "Transaction would fail - check your inputs";
    }
    if (error.message.includes("execution reverted")) {
      return "Transaction failed - check contract state";
    }
    
    return error.message;
  }
  
  return "An unexpected error occurred";
}
