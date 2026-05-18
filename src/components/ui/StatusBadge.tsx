import React from 'react';

type StatusType = 'CRITICAL' | 'WARNING' | 'NORMAL' | 'RESOLVED' | 'NOTIFIED' | 'PENDING' | 'ACTIVE' | 'INACTIVE';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  CRITICAL: { label: 'Critical', className: 'bg-critical/15 text-critical border border-critical/40' },
  WARNING: { label: 'Warning', className: 'bg-warning/15 text-warning border border-warning/40' },
  NORMAL: { label: 'Normal', className: 'bg-success/15 text-success border border-success/40' },
  RESOLVED: { label: 'Resolved', className: 'bg-muted text-muted-foreground border border-border' },
  NOTIFIED: { label: 'Notified', className: 'bg-info/15 text-info border border-info/40' },
  PENDING: { label: 'Pending', className: 'bg-warning/15 text-warning border border-warning/40' },
  ACTIVE: { label: 'Active', className: 'bg-success/15 text-success border border-success/40' },
  INACTIVE: { label: 'Inactive', className: 'bg-muted text-muted-foreground border border-border' },
};

export default function StatusBadge({ status, size = 'sm', pulse = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.RESOLVED;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${config.className}`}>
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            status === 'CRITICAL' ? 'bg-critical pulse-critical' : 'bg-warning pulse-warning'
          }`}
        />
      )}
      {config.label}
    </span>
  );
}