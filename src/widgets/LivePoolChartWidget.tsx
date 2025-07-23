'use client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber, generateVolumeHistory } from '@/lib/chartData';
import { CandlestickChart, LineChart } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface ChartConfig {
  selectedTokens?: string[];
  sortBy?: string;
  selectedPair?: string;
  chartType?: 'candlestick' | 'line';
  overlays?: {
    priceRange: boolean;
    tick: boolean;
    volume: boolean;
    volatility: boolean;
  };
  [key: string]: unknown;
}

interface LivePoolChartWidgetProps {
  widgetId?: string;
  config?: ChartConfig;
  onConfigUpdate?: (config: ChartConfig) => void;
}

function generateCandlestickData(currentPrice: number, days: number) {
  const data = [];
  const now = new Date();
  let price = currentPrice * 0.95;

  for (let i = days; i > 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayVolatility = 0.02 + Math.random() * 0.03;
    
    const open = price;
    const change = (Math.random() - 0.45) * dayVolatility;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * dayVolatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * dayVolatility * 0.5);
    
    data.push({
      time: date.toISOString(),
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      open,
      high,
      low,
      close,
      volume: 500000 + Math.random() * 2000000,
      price: close
    });
    
    price = close;
  }
  
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isGreen = payload.close >= payload.open;
  const color = isGreen ? '#10b981' : '#ef4444';
  
  const highY = y;
  const lowY = y + height;
  const bodyTop = isGreen ? y + height * (1 - (payload.close - payload.low) / (payload.high - payload.low)) : y + height * (1 - (payload.open - payload.low) / (payload.high - payload.low));
  const bodyHeight = Math.abs(height * (payload.close - payload.open) / (payload.high - payload.low));
  
  return (
    <g>
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={x + width * 0.2}
        y={bodyTop}
        width={width * 0.6}
        height={Math.max(bodyHeight, 1)}
        fill={color}
        fillOpacity={isGreen ? 1 : 0.8}
      />
    </g>
  );
};

export default function LivePoolChartWidget({ config, onConfigUpdate }: LivePoolChartWidgetProps) {
  const [chartType, setChartType] = useState<'candlestick' | 'line'>(config?.chartType || 'candlestick');
  const [selectedPair, setSelectedPair] = useState(config?.selectedPair || 'SOL-USDC');
  const [overlays, setOverlays] = useState({
    priceRange: config?.overlays?.priceRange || false,
    tick: config?.overlays?.tick || false,
    volume: config?.overlays?.volume || true,
    volatility: config?.overlays?.volatility || false,
  });

  const tokenPairs = [
    { pair: 'SOL-USDC', price: 132.45 },
    { pair: 'SOL-USDT', price: 132.38 },
    { pair: 'ETH-USDC', price: 2245.67 },
    { pair: 'BTC-USDC', price: 42150.00 },
    { pair: 'BONK-USDC', price: 0.000012 },
    { pair: 'JTO-USDC', price: 2.45 },
    { pair: 'JUP-USDC', price: 0.89 },
    { pair: 'WIF-USDC', price: 1.23 },
    { pair: 'PYTH-USDC', price: 0.34 },
    { pair: 'ORCA-USDC', price: 4.56 }
  ];

  const currentPairData = tokenPairs.find(p => p.pair === selectedPair) || tokenPairs[0];

  const chartData = useMemo(() => {
    const priceData = generateCandlestickData(currentPairData.price, 30);
    const volumeData = generateVolumeHistory(30);
    
    return priceData.map((item, index) => ({
      ...item,
      volume: volumeData[index]?.volume || item.volume,
      priceRangeUpper: item.close * 1.02,
      priceRangeLower: item.close * 0.98,
      volatility: Math.abs(item.close - item.open) / item.open * 100,
      tick: Math.floor(Math.log(item.close) / Math.log(1.0001))
    }));
  }, [currentPairData.price]);

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    onConfigUpdate?.({ selectedPair: pair, chartType, overlays });
  };

  const handleChartTypeChange = (type: 'candlestick' | 'line') => {
    setChartType(type);
    onConfigUpdate?.({ selectedPair, chartType: type, overlays });
  };

  const toggleOverlay = (overlay: keyof typeof overlays) => {
    const newOverlays = { ...overlays, [overlay]: !overlays[overlay] };
    setOverlays(newOverlays);
    onConfigUpdate?.({ selectedPair, chartType, overlays: newOverlays });
  };

  const latestData = chartData[chartData.length - 1];
  const prevData = chartData[chartData.length - 2];
  const priceChange = ((latestData.close - prevData.close) / prevData.close * 100);
  const volume24h = chartData.slice(-1)[0].volume;

  return (
    <div className="flex flex-col h-full p-3 space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedPair} onValueChange={handlePairChange}>
          <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tokenPairs.map(({ pair }) => (
              <SelectItem key={pair} value={pair} className="text-xs">
                {pair}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant={chartType === 'candlestick' ? 'default' : 'outline'}
            onClick={() => handleChartTypeChange('candlestick')}
            className="h-8 px-2"
            title="Candlestick Chart"
          >
            <CandlestickChart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={chartType === 'line' ? 'default' : 'outline'}
            onClick={() => handleChartTypeChange('line')}
            className="h-8 px-2"
            title="Line Chart"
          >
            <LineChart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={overlays.priceRange ? 'default' : 'outline'}
          onClick={() => toggleOverlay('priceRange')}
          className="h-7 px-2 text-xs"
        >
          Price Range
        </Button>
        <Button
          size="sm"
          variant={overlays.tick ? 'default' : 'outline'}
          onClick={() => toggleOverlay('tick')}
          className="h-7 px-2 text-xs"
        >
          Tick
        </Button>
        <Button
          size="sm"
          variant={overlays.volume ? 'default' : 'outline'}
          onClick={() => toggleOverlay('volume')}
          className="h-7 px-2 text-xs"
        >
          Volume
        </Button>
        <Button
          size="sm"
          variant={overlays.volatility ? 'default' : 'outline'}
          onClick={() => toggleOverlay('volatility')}
          className="h-7 px-2 text-xs"
        >
          Volatility
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'candlestick' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="price"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                className="text-muted-foreground"
                domain={['dataMin * 0.98', 'dataMax * 1.02']}
              />
              {overlays.volume && (
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => formatNumber(value)}
                  className="text-muted-foreground"
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  if (name === 'volume') return [formatNumber(value), 'Volume'];
                  return [`$${value.toFixed(4)}`, name];
                }}
              />
              
              <Bar
                yAxisId="price"
                dataKey="high"
                shape={CandlestickShape}
                isAnimationActive={false}
              />
              
              {overlays.volume && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="#3b82f6"
                  opacity={0.3}
                />
              )}
              
              {overlays.priceRange && (
                <>
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="priceRangeUpper"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="priceRangeLower"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="price"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                className="text-muted-foreground"
                domain={['dataMin * 0.98', 'dataMax * 1.02']}
              />
              {overlays.volume && (
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => formatNumber(value)}
                  className="text-muted-foreground"
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  if (name === 'volume') return [formatNumber(value), 'Volume'];
                  if (name === 'volatility') return [`${value.toFixed(2)}%`, 'Volatility'];
                  return [`$${value.toFixed(4)}`, name];
                }}
              />
              
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
              
              {overlays.volume && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="#10b981"
                  opacity={0.3}
                />
              )}
              
              {overlays.priceRange && (
                <>
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="priceRangeUpper"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="priceRangeLower"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </>
              )}
              
              {overlays.volatility && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="volatility"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  dot={false}
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>24h Vol: {formatNumber(volume24h)}</span>
        <span>Last: ${latestData.close.toFixed(2)}</span>
        <span className={priceChange >= 0 ? "text-green-500" : "text-red-500"}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );
} 