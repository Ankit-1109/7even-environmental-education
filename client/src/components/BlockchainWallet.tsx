import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Wallet, Coins, Shield, ExternalLink, Trophy, Zap } from 'lucide-react';

// Import blockchain service (this would be available on client-side)
const detectEthereumProvider = async () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
};

interface WalletInfo {
  address: string;
  balance: number;
  polygonCredits: number;
  connected: boolean;
}

export function BlockchainWallet() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Fetch user's blockchain data
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/blockchain/transactions'],
    enabled: !!walletInfo?.connected,
  });

  const { data: nfts = [] } = useQuery({
    queryKey: ['/api/blockchain/nfts'],
    enabled: !!walletInfo?.connected,
  });

  const { data: pools = [] } = useQuery({
    queryKey: ['/api/blockchain/pools'],
  });

  // Connect wallet mutation
  const connectWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      const response = await apiRequest('POST', '/api/blockchain/connect-wallet', {
        walletAddress,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Wallet Connected!',
        description: 'Your MetaMask wallet has been connected successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
    onError: () => {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mint credits mutation (demo)
  const mintCreditsMutation = useMutation({
    mutationFn: async (amount: number) => {
      // This would actually interact with blockchain
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const response = await apiRequest('POST', '/api/blockchain/mint-credits', {
        amount,
        transactionHash: mockTxHash,
        toAddress: walletInfo?.address,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Credits Minted!',
        description: 'EcoCredits have been minted to your wallet.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blockchain/transactions'] });
    },
  });

  // Connect to MetaMask
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        toast({
          title: 'MetaMask Required',
          description: 'Please install MetaMask to use blockchain features.',
          variant: 'destructive',
        });
        return;
      }

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        
        // Connect to backend
        await connectWalletMutation.mutateAsync(address);
        
        setWalletInfo({
          address,
          balance: 0, // Would fetch real balance
          polygonCredits: 0,
          connected: true,
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to MetaMask.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = await detectEthereumProvider();
      if (ethereum) {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletInfo({
            address: accounts[0],
            balance: 0,
            polygonCredits: 0,
            connected: true,
          });
        }
      }
    };
    checkConnection();
  }, []);

  if (!walletInfo?.connected) {
    return (
      <Card className="w-full max-w-md mx-auto" data-testid="wallet-connect-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to earn real EcoCredits on Polygon blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full"
            data-testid="button-connect-wallet"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
          
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure wallet connection</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span>Earn real cryptocurrency rewards</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Collect NFT certificates</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="wallet-dashboard">
      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Blockchain Wallet
          </CardTitle>
          <CardDescription>
            Connected to Polygon Mumbai Testnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Wallet Address</div>
              <div className="font-mono text-sm" data-testid="text-wallet-address">
                {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">MATIC Balance</div>
                <div className="text-lg font-semibold" data-testid="text-matic-balance">
                  {walletInfo.balance.toFixed(4)} MATIC
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">EcoCredits</div>
                <div className="text-lg font-semibold text-green-600" data-testid="text-polygon-credits">
                  {walletInfo.polygonCredits} ECO
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Actions</CardTitle>
          <CardDescription>
            Interact with the Polygon blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={() => mintCreditsMutation.mutate(10)}
              disabled={mintCreditsMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-mint-credits"
            >
              <Zap className="h-4 w-4" />
              {mintCreditsMutation.isPending ? 'Minting...' : 'Mint 10 Credits (Demo)'}
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-view-polygon"
            >
              <ExternalLink className="h-4 w-4" />
              View on PolygonScan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {Array.isArray(transactions) && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{tx.transactionType?.replace('_', ' ') || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {tx.transactionHash?.slice(0, 10) || ''}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{tx.amount || 0} ECO</div>
                    <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                      {tx.status || 'pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NFT Certificates */}
      {Array.isArray(nfts) && nfts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              NFT Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nfts.map((nft: any) => (
                <div key={nft.id} className="border rounded-lg p-4" data-testid={`nft-${nft.id}`}>
                  <div className="font-medium">{nft.title || 'Untitled NFT'}</div>
                  <div className="text-sm text-muted-foreground">{nft.description || 'No description'}</div>
                  <Badge className="mt-2">{nft.nftType || 'achievement'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}