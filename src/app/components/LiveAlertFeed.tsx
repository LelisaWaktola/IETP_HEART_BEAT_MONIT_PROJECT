'use client';

import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


export interface FeedEvent {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'RESOLVED' | 'INFO';
  message: string;
  time: string;
}

const SEED_EVENTS: FeedEvent[] = [
  { id: 'feed-001', type: 'CRITICAL', message: 'PT-101 Yonas Tadesse — BPM 48 detected', time: '16:59' },
  { id: 'feed-002', type: 'INFO',     message: 'SMS sent to Dr. Aisha Mengesha for PT-101', time: '16:59' },
  { id: 'feed-003', type: 'WARNING',  message: 'PT-205 Fatima Al-Rashid — BPM 112 elevated', time: '16:57' },
  { id: 'feed-004', type: 'INFO',     message: 'Email sent to Dr. Kebede Girma for PT-205', time: '16:57' },
  { id: 'feed-005', type: 'CRITICAL', message: 'PT-318 Marcos Oliveira — BPM 44 detected', time: '16:52' },
  { id: 'feed-006', type: 'RESOLVED', message: 'PT-089 Amara Diallo — BPM stabilised at 72', time: '16:48' },
  { id: 'feed-007', type: 'WARNING',  message: 'PT-412 Chen Wei — BPM 58 low-normal', time: '16:41' },
];

const TYPE_CONFIG = {
  CRITICAL: { icon: AlertTriangle, color: 'text-critical', bg: 'bg-critical/10', dot: 'bg-critical' },
  WARNING:  { icon: AlertTriangle, color: 'text-warning',  bg: 'bg-warning/10',  dot: 'bg-warning'  },
  RESOLVED: { icon: CheckCircle,   color: 'text-success',  bg: 'bg-success/10',  dot: 'bg-success'  },
  INFO:     { icon: Info,          color: 'text-info',     bg: 'bg-info/10',     dot: 'bg-info'     },
};

interface LiveAlertFeedProps {
  /** Live events pushed from SSE. Falls back to seed events when empty. */
  events?: FeedEvent[];
}

export default function LiveAlertFeed({ events }: LiveAlertFeedProps) {
  const display = events && events.length > 0 ? events : SEED_EVENTS;

  return (
    <div className="space-y-1.5 overflow-y-auto scrollbar-thin max-h-[400px]">
      {display.map((event) => {
        const cfg = TYPE_CONFIG[event.type];
        const Icon = cfg.icon;
        return (
          <div
            key={event.id}
            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg ${cfg.bg} border border-transparent hover:border-border transition-all duration-150`}
          >
            <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${cfg.dot}`} />
            <Icon size={13} className={`flex-shrink-0 mt-0.5 ${cfg.color}`} />
            <p className="text-xs text-foreground leading-relaxed flex-1">{event.message}</p>
            <span className="font-mono-data text-xs text-muted-foreground flex-shrink-0">{event.time}</span>
          </div>
        );
      })}
    </div>
  );
}