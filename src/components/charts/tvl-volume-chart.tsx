"use client";

import { formatNumber } from "@/lib/chartData";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface TVLVolumeChartProps {
  data: Array<{
    time: string;
    tvl?: number;
    volume?: number;
  }>;
  showTVL?: boolean;
  showVolume?: boolean;
}

export function TVLVolumeChart({ 
  data, 
  showTVL = true, 
  showVolume = true 
}: TVLVolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          className="text-muted-foreground"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => formatNumber(value)}
          className="text-muted-foreground"
        />
        {showVolume && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatNumber(value)}
            className="text-muted-foreground"
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number, name: string) => [
            formatNumber(value),
            name === "tvl" ? "TVL" : "Volume"
          ]}
          labelFormatter={(label) => {
            const date = new Date(label);
            return date.toLocaleDateString();
          }}
        />
        {showVolume && (
          <Bar
            yAxisId="right"
            dataKey="volume"
            fill="url(#volumeGradient)"
            opacity={0.8}
          />
        )}
        {showTVL && (
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tvl"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
} 