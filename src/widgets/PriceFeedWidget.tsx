'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Settings, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

// Available tokens to choose from
const availableTokens: TokenPrice[] = [
  { symbol: 'SOL', price: 98.45, change24h: 5.2 },
  { symbol: 'USDC', price: 1.00, change24h: 0.01 },
  { symbol: 'ORCA', price: 2.34, change24h: -3.1 },
  { symbol: 'BONK', price: 0.000015, change24h: 12.5 },
  { symbol: 'JUP', price: 0.89, change24h: -1.2 },
  { symbol: 'PYTH', price: 0.41, change24h: 8.7 },
  { symbol: 'RAY', price: 1.82, change24h: -2.4 },
  { symbol: 'MNDE', price: 0.156, change24h: 4.3 },
];

interface PriceFeedWidgetProps {
  widgetId?: string;
  config?: { selectedTokens?: string[] };
  onConfigUpdate?: (config: { selectedTokens: string[] }) => void;
}

export default function PriceFeedWidget({ widgetId, config, onConfigUpdate }: PriceFeedWidgetProps) {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<string[]>(
    config?.selectedTokens || ['SOL', 'USDC', 'ORCA', 'BONK', 'JUP']
  );
  const [tempSelectedTokens, setTempSelectedTokens] = useState<string[]>(selectedTokens);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const filteredTokens = availableTokens.filter(token => 
        selectedTokens.includes(token.symbol)
      );
      setTokens(filteredTokens);
      setIsLoading(false);
    }, 1000);
  }, [selectedTokens]);

  const handleSaveConfig = () => {
    setSelectedTokens(tempSelectedTokens);
    onConfigUpdate?.({ selectedTokens: tempSelectedTokens });
    setIsConfiguring(false);
  };

  const handleCancelConfig = () => {
    setTempSelectedTokens(selectedTokens);
    setIsConfiguring(false);
  };

  const toggleToken = (symbol: string) => {
    setTempSelectedTokens(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (isConfiguring) {
    return (
      <div className="p-2 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium">Select Tokens</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleSaveConfig}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelConfig}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 max-h-[200px] overflow-auto">
          {availableTokens.map((token) => (
            <Button
              key={token.symbol}
              size="sm"
              variant={tempSelectedTokens.includes(token.symbol) ? "default" : "outline"}
              className="h-7 text-xs justify-start"
              onClick={() => toggleToken(token.symbol)}
            >
              {token.symbol}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-auto h-full p-2">
      <div className="flex justify-end mb-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => setIsConfiguring(true)}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
      {tokens.map((token) => (
        <Card key={token.symbol} className="p-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">{token.symbol}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                ${token.price < 0.01 ? token.price.toExponential(2) : token.price.toFixed(2)}
              </span>
              <div className={`flex items-center gap-0.5 text-xs ${
                token.change24h > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {token.change24h > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(token.change24h).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 