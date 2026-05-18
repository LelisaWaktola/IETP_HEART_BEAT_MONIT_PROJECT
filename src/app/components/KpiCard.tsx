import React from 'react';
import { LucideIcon } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'critical' | 'warning' | 'success' | 'info';
  hero?: boolean;
}

const VARIANT_STYLES: Record<string, { card: string; icon: string; value: string }> = {
  default: { card: 'bg-card border-border', icon: 'bg-muted text-muted-foreground', value: 'text-foreground' },
  critical: { card: 'card-critical', icon: 'bg-critical/20 text-critical', value: 'text-critical' },
  warning: { card: 'card-warning', icon: 'bg-warning/20 text-warning', value: 'text-warning' },
  success: { card: 'card-normal', icon: 'bg-success/20 text-success', value: 'text-success' },
  info: { card: 'card-info', icon: 'bg-info/20 text-info', value: 'text-info' },
};

export default function KpiCard({ label, value, unit, subtext, icon: Icon, trend, variant = 'default', hero = false }: KpiCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 h-full ${styles.card}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
          <Icon size={16} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className={`font-mono-data font-bold leading-none ${hero ? 'text-5xl' : 'text-3xl'} ${styles.value}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
      </div>

      {(subtext || trend) && (
        <div className="flex items-center justify-between">
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          {trend && (
            <span className={`text-xs font-medium ${trend.positive ? 'text-success' : 'text-critical'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}