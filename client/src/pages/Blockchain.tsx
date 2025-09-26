import { BlockchainWallet } from '@/components/BlockchainWallet';

export function Blockchain() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-blockchain">
          Blockchain EcoCredits
        </h1>
        <p className="text-muted-foreground">
          Connect your wallet to earn real cryptocurrency rewards and collect NFT certificates
        </p>
      </div>
      
      <BlockchainWallet />
    </div>
  );
}