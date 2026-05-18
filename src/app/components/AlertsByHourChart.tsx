'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  } from 'recharts';

interface HourlyAlert {
  hour: string;
  critical: number;
  warning: number;
}

interface AlertsByHourChartProps {
  data: HourlyAlert[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, idx: number) => (
        <p key={`tip-${idx}`} className="font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AlertsByHourChart({ data }: AlertsByHourChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={8} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="critical" name="Critical" fill="var(--critical)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="warning" name="Warning" fill="var(--warning)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}