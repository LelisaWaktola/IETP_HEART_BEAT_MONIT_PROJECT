'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

interface NotificationRateChartProps {
  rate: number;
}

export default function NotificationRateChart({ rate }: NotificationRateChartProps) {
  const data = [
    { name: 'Notified', value: rate, fill: 'var(--success)' },
    { name: 'Missed', value: 100, fill: 'var(--border)' },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={120} height={120}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={36}
          outerRadius={52}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--border)' }} />
          <Tooltip
            content={() => null}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono-data text-xl font-bold text-success">{rate}%</span>
        <span className="text-xs text-muted-foreground">notified</span>
      </div>
    </div>
  );
}