"use client";

import { formatAmount } from "@/lib/chartData";
import { useState } from "react";
import {
    Bar,
    BarChart,
    Brush,
    CartesianGrid,
    Cell,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface LiquidityDistributionProps {
  data: Array<{
    price: number;
    liquidity: number;
    isActive?: boolean;
  }>;
  currentPrice: number;
}

export function LiquidityDistribution({ 
  data, 
  currentPrice 
}: LiquidityDistributionProps) {
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No liquidity data available
      </div>
    );
  }

  // Find the index of the current price for initial zoom
  const currentPriceIndex = data.findIndex(
    (item) => Math.abs(item.price - currentPrice) < currentPrice * 0.01
  );
  const defaultStartIndex = Math.max(0, currentPriceIndex - 10);
  const defaultEndIndex = Math.min(data.length - 1, currentPriceIndex + 10);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 10, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="price"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
          className="text-muted-foreground"
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => formatAmount(value)}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number) => [formatAmount(value), "Liquidity"]}
          labelFormatter={(label) => `Price: $${Number(label).toFixed(4)}`}
        />
        <ReferenceLine
          x={currentPrice}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{
            value: "Current Price",
            position: "top",
            fill: "#ef4444",
            fontSize: 12,
          }}
        />
        <Bar dataKey="liquidity">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isActive ? "#10b981" : "#3b82f6"}
              opacity={entry.isActive ? 1 : 0.6}
            />
          ))}
        </Bar>
        <Brush
          dataKey="price"
          height={30}
          stroke="#3b82f6"
          startIndex={zoomRange ? zoomRange[0] : defaultStartIndex}
          endIndex={zoomRange ? zoomRange[1] : defaultEndIndex}
          onChange={(range: { startIndex?: number; endIndex?: number }) => {
            if (range && range.startIndex !== undefined && range.endIndex !== undefined) {
              setZoomRange([range.startIndex, range.endIndex]);
            }
          }}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 