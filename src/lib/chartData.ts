import { Decimal } from "decimal.js";

// Generate mock price history data
export function generatePriceHistory(currentPrice: number, days: number = 30) {
  const data = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  // Start with a base price 30 days ago
  let price = currentPrice * (0.8 + Math.random() * 0.4); // ±20% from current
  
  for (let i = days; i >= 0; i--) {
    // Add some volatility
    const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
    price = price * (1 + change);
    
    // Trend towards current price as we get closer to present
    if (i < 7) {
      price = price * 0.9 + currentPrice * 0.1;
    }
    
    data.push({
      time: new Date(now - i * dayInMs).toISOString().split('T')[0],
      price: Number(price.toFixed(4)),
    });
  }
  
  // Ensure last price matches current price
  if (data.length > 0) {
    data[data.length - 1].price = currentPrice;
  }
  
  return data;
}

// Generate mock TVL data
export function generateTVLHistory(currentLiquidity: string, days: number = 30) {
  const data = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  // Convert liquidity to a rough TVL estimate (simplified)
  const baseTVL = new Decimal(currentLiquidity).div(1e6).toNumber();
  let tvl = baseTVL * 0.7; // Start lower
  
  for (let i = days; i >= 0; i--) {
    // Gradual growth with some volatility
    const change = (Math.random() - 0.3) * 0.1; // Bias towards growth
    tvl = tvl * (1 + change);
    
    data.push({
      time: new Date(now - i * dayInMs).toISOString().split('T')[0],
      tvl: Number(tvl.toFixed(2)),
    });
  }
  
  return data;
}

// Generate mock volume data
export function generateVolumeHistory(days: number = 30) {
  const data = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  for (let i = days; i >= 0; i--) {
    // Random volume between 100k and 10M
    const volume = 100000 + Math.random() * 9900000;
    
    data.push({
      time: new Date(now - i * dayInMs).toISOString().split('T')[0],
      volume: Number(volume.toFixed(0)),
    });
  }
  
  return data;
}

// Generate liquidity distribution data
export function generateLiquidityDistribution(
  currentPrice: number,
  tickSpacing: number,
  currentTick: number
) {
  const data = [];
  const priceRange = 0.5; // Show ±50% from current price
  const numBins = 50;
  
  const minPrice = currentPrice * (1 - priceRange);
  const maxPrice = currentPrice * (1 + priceRange);
  const priceStep = (maxPrice - minPrice) / numBins;
  
  for (let i = 0; i < numBins; i++) {
    const price = minPrice + i * priceStep;
    const distance = Math.abs(price - currentPrice) / currentPrice;
    
    // Simulate liquidity concentration around current price
    // Using a bell curve distribution
    const liquidity = Math.exp(-Math.pow(distance * 10, 2)) * 1000000;
    
    data.push({
      price: Number(price.toFixed(4)),
      liquidity: Number(liquidity.toFixed(0)),
      isActive: Math.abs(price - currentPrice) < currentPrice * 0.02, // ±2% is active
    });
  }
  
  return data;
}

// Format large numbers for display
export function formatNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

// Format number without currency
export function formatAmount(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
} 