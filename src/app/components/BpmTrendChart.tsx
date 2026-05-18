'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface BpmDataPoint {
  time: string;
  bpm: number;
  patientId: string;
}

interface BpmTrendChartProps {
  data: BpmDataPoint[];
  patientName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const bpm = payload[0]?.value as number;
  const color = bpm < 50 || bpm > 120 ? 'var(--critical)' : bpm < 60 || bpm > 100 ? 'var(--warning)' : 'var(--success)';
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-mono-data text-base font-bold" style={{ color }}>
        {bpm} <span className="text-xs font-normal text-muted-foreground">BPM</span>
      </p>
    </div>
  );
};

export default function BpmTrendChart({ data, patientName }: BpmTrendChartProps) {
  return (
    <div className="w-full h-full">
      {patientName && (
        <p className="text-xs text-muted-foreground mb-2">
          Showing readings for <span className="text-foreground font-medium">{patientName}</span>
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[30, 140]}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={60} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={100} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={50} stroke="var(--critical)" strokeDasharray="4 4" strokeWidth={1.5} />
          <Area
            type="monotone"
            dataKey="bpm"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#bpmGradient)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}