'use client';

import React, { useState } from 'react';
import { MapPin, MessageSquare, Mail, Phone, CheckCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

export interface AlertData {
  id: string;
  patientId: string;
  patientName: string;
  bpm: number;
  status: 'CRITICAL' | 'WARNING' | 'NORMAL';
  timestamp: string;
  location: { lat: number; lng: number; label: string };
  doctorNotified: boolean;
  doctorName: string;
  notificationMethod: 'SMS' | 'Email' | 'Both' | null;
  ward: string;
  age: number;
}

function getBpmColor(bpm: number): string {
  if (bpm < 50 || bpm > 120) return 'bpm-critical';
  if (bpm < 60 || bpm > 100) return 'bpm-warning';
  return 'bpm-normal';
}

function getElapsed(timestamp: string): string {
  const now = new Date('2026-05-18T16:59:15Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m ago`;
}

interface AlertCardProps {
  alert: AlertData;
  onAcknowledge: (id: string) => void;
}

export default function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  const cardClass =
    alert.status === 'CRITICAL' ?'card-critical'
      : alert.status === 'WARNING' ?'card-warning' :'card-normal';

  const mapUrl = `https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`;

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 ${cardClass}`}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{alert.patientName}</span>
            <span className="font-mono-data text-xs text-muted-foreground">#{alert.patientId}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{alert.ward}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">Age {alert.age}</span>
          </div>
        </div>
        <StatusBadge status={alert.status} pulse={alert.status === 'CRITICAL'} />
      </div>

      {/* BPM Hero */}
      <div className="flex items-end gap-2 mb-3">
        <span className={`font-mono-data text-4xl font-bold leading-none ${getBpmColor(alert.bpm)}`}>
          {alert.bpm}
        </span>
        <span className="text-sm text-muted-foreground mb-1 font-medium">BPM</span>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} />
          {getElapsed(alert.timestamp)}
        </div>
      </div>

      {/* Notification Status */}
      <div className="flex items-center gap-2 mb-3">
        {alert.doctorNotified ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 border border-success/30 rounded-full px-2.5 py-1">
            <CheckCircle size={11} />
            Dr. {alert.doctorName} notified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/10 border border-warning/30 rounded-full px-2.5 py-1">
            <Clock size={11} />
            Notifying doctor…
          </span>
        )}
        {alert.notificationMethod && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {alert.notificationMethod === 'SMS' && <Phone size={11} />}
            {alert.notificationMethod === 'Email' && <Mail size={11} />}
            {alert.notificationMethod === 'Both' && <MessageSquare size={11} />}
            {alert.notificationMethod}
          </span>
        )}
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2">
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-info bg-info/10 border border-info/30 rounded-lg px-3 py-1.5 hover:bg-info/20 transition-all duration-150"
        >
          <MapPin size={12} />
          {alert.location.label}
          <ExternalLink size={10} className="opacity-60" />
        </a>

        {!alert.doctorNotified && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="ml-auto text-xs font-medium text-primary bg-primary/10 border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/20 transition-all duration-150 active:scale-95"
          >
            Acknowledge
          </button>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150"
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 animate-fade-in">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Alert ID</p>
            <p className="font-mono-data text-xs text-foreground">{alert.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Timestamp</p>
            <p className="font-mono-data text-xs text-foreground">
              {new Date(alert.timestamp).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Coordinates</p>
            <p className="font-mono-data text-xs text-foreground">
              {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Assigned Doctor</p>
            <p className="text-xs font-medium text-foreground">{alert.doctorName}</p>
          </div>
        </div>
      )}
    </div>
  );
}