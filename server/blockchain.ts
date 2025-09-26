import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import type { InsertBlockchainTransaction, InsertNftCertificate } from '@shared/schema';

// Polygon Mumbai Testnet configuration
const POLYGON_MUMBAI_CONFIG = {
  chainId: 80001,
  chainName: 'Polygon Mumbai Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
  blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
};

// EcoCredits Token Contract ABI (simplified ERC20)
const ECOCREDITS_ABI = [
  'function mint(address to, uint256 amount) external',
  'function burn(address from, uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function totalSupply() external view returns (uint256)',
];

// NFT Certificate Contract ABI (simplified ERC721)
const NFT_CERTIFICATE_ABI = [
  'function mint(address to, string memory tokenURI) external returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function balanceOf(address owner) external view returns (uint256)',
];

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private ecoCreditsContract: ethers.Contract | null = null;
  private nftContract: ethers.Contract | null = null;

  // Contract addresses (these would be deployed on Polygon Mumbai)
  private readonly ECOCREDITS_CONTRACT = '0x1234567890123456789012345678901234567890'; // Placeholder
  private readonly NFT_CONTRACT = '0x0987654321098765432109876543210987654321'; // Placeholder

  async initialize(): Promise<boolean> {
    try {
      // Detect MetaMask or other Web3 provider
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        console.warn('No Web3 provider detected. MetaMask is required for blockchain features.');
        return false;
      }

      this.provider = new ethers.BrowserProvider(ethereum as any);
      
      // Request account access
      await this.provider.send('eth_requestAccounts', []);
      
      // Check if user is on Polygon Mumbai
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== POLYGON_MUMBAI_CONFIG.chainId) {
        await this.switchToPolygon();
      }

      this.signer = await this.provider.getSigner();
      
      // Initialize contracts
      this.ecoCreditsContract = new ethers.Contract(
        this.ECOCREDITS_CONTRACT,
        ECOCREDITS_ABI,
        this.signer
      );

      this.nftContract = new ethers.Contract(
        this.NFT_CONTRACT,
        NFT_CERTIFICATE_ABI,
        this.signer
      );

      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      return false;
    }
  }

  async switchToPolygon(): Promise<void> {
    if (!this.provider) throw new Error('Provider not initialized');

    try {
      // Try to switch to Polygon Mumbai
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${POLYGON_MUMBAI_CONFIG.chainId.toString(16)}` }
      ]);
    } catch (switchError: any) {
      // Chain doesn't exist, add it
      if (switchError.code === 4902) {
        await this.provider.send('wallet_addEthereumChain', [
          {
            chainId: `0x${POLYGON_MUMBAI_CONFIG.chainId.toString(16)}`,
            chainName: POLYGON_MUMBAI_CONFIG.chainName,
            nativeCurrency: POLYGON_MUMBAI_CONFIG.nativeCurrency,
            rpcUrls: POLYGON_MUMBAI_CONFIG.rpcUrls,
            blockExplorerUrls: POLYGON_MUMBAI_CONFIG.blockExplorerUrls,
          }
        ]);
      } else {
        throw switchError;
      }
    }
  }

  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async getEcoCreditsBalance(address: string): Promise<number> {
    if (!this.ecoCreditsContract) return 0;
    
    try {
      const balance = await this.ecoCreditsContract.balanceOf(address);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to get EcoCredits balance:', error);
      return 0;
    }
  }

  async mintEcoCredits(
    toAddress: string, 
    amount: number
  ): Promise<InsertBlockchainTransaction | null> {
    if (!this.ecoCreditsContract || !this.signer) return null;

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.ecoCreditsContract.mint(toAddress, amountWei);
      
      return {
        userId: '', // To be filled by caller
        transactionHash: tx.hash,
        blockchainNetwork: 'polygon',
        transactionType: 'mint_credits',
        amount: amount,
        status: 'pending',
        toAddress: toAddress,
        fromAddress: await this.signer.getAddress(),
      };
    } catch (error) {
      console.error('Failed to mint EcoCredits:', error);
      return null;
    }
  }

  async mintNFTCertificate(
    toAddress: string,
    metadata: any
  ): Promise<{ transaction: InsertBlockchainTransaction; nft: Partial<InsertNftCertificate> } | null> {
    if (!this.nftContract || !this.signer) return null;

    try {
      // In a real implementation, you'd upload metadata to IPFS
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      
      const tx = await this.nftContract.mint(toAddress, tokenURI);
      
      const transaction: InsertBlockchainTransaction = {
        userId: '', // To be filled by caller
        transactionHash: tx.hash,
        blockchainNetwork: 'polygon',
        transactionType: 'mint_nft',
        amount: 0,
        status: 'pending',
        toAddress: toAddress,
        fromAddress: await this.signer.getAddress(),
      };

      const nft: Partial<InsertNftCertificate> = {
        userId: '', // To be filled by caller
        tokenId: '', // Will be set after transaction confirmation
        contractAddress: this.NFT_CONTRACT,
        nftType: metadata.type || 'achievement',
        title: metadata.title,
        description: metadata.description,
        metadata: metadata,
        imageUrl: metadata.image,
        blockchainNetwork: 'polygon',
        transactionHash: tx.hash,
      };

      return { transaction, nft };
    } catch (error) {
      console.error('Failed to mint NFT certificate:', error);
      return null;
    }
  }

  async waitForTransactionConfirmation(txHash: string): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) return null;

    try {
      return await this.provider.waitForTransaction(txHash);
    } catch (error) {
      console.error('Transaction confirmation failed:', error);
      return null;
    }
  }

  async getGasEstimate(transaction: any): Promise<string> {
    if (!this.provider) return '0';

    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      return ethers.formatEther(gasEstimate);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return '0';
    }
  }

  // Staking functionality for blockchain pools
  async stakeCredits(poolAddress: string, amount: number): Promise<InsertBlockchainTransaction | null> {
    if (!this.ecoCreditsContract || !this.signer) return null;

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.ecoCreditsContract.transfer(poolAddress, amountWei);
      
      return {
        userId: '', // To be filled by caller
        transactionHash: tx.hash,
        blockchainNetwork: 'polygon',
        transactionType: 'stake_credits',
        amount: amount,
        status: 'pending',
        toAddress: poolAddress,
        fromAddress: await this.signer.getAddress(),
      };
    } catch (error) {
      console.error('Failed to stake credits:', error);
      return null;
    }
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();