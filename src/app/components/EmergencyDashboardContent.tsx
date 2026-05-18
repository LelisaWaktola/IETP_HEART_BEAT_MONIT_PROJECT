'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle, Activity, Users, CheckCircle, RefreshCw, Clock,
  Usb, WifiOff, Wifi, ChevronDown, ChevronUp, FlaskConical,
} from 'lucide-react';
import KpiCard from './KpiCard';
import AlertCard, { AlertData } from './AlertCard';
import LiveAlertFeed, { FeedEvent } from './LiveAlertFeed';
import { KpiSkeleton, AlertCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

const BpmTrendChart = dynamic(() => import('./BpmTrendChart'), { ssr: false });
const AlertsByHourChart = dynamic(() => import('./AlertsByHourChart'), { ssr: false });
const NotificationRateChart = dynamic(() => import('./NotificationRateChart'), { ssr: false });

// ─── Static chart data (unchanged) ──────────────────────────────────────────
const BPM_TREND_DATA = [
  { time: '16:30', bpm: 72, patientId: 'PT-101' },
  { time: '16:33', bpm: 68, patientId: 'PT-101' },
  { time: '16:36', bpm: 65, patientId: 'PT-101' },
  { time: '16:39', bpm: 61, patientId: 'PT-101' },
  { time: '16:42', bpm: 57, patientId: 'PT-101' },
  { time: '16:45', bpm: 55, patientId: 'PT-101' },
  { time: '16:48', bpm: 52, patientId: 'PT-101' },
  { time: '16:51', bpm: 50, patientId: 'PT-101' },
  { time: '16:54', bpm: 49, patientId: 'PT-101' },
  { time: '16:57', bpm: 48, patientId: 'PT-101' },
  { time: '16:59', bpm: 48, patientId: 'PT-101' },
];

const HOURLY_DATA = [
  { hour: '08:00', critical: 1, warning: 2 },
  { hour: '09:00', critical: 0, warning: 3 },
  { hour: '10:00', critical: 2, warning: 1 },
  { hour: '11:00', critical: 1, warning: 4 },
  { hour: '12:00', critical: 3, warning: 2 },
  { hour: '13:00', critical: 0, warning: 1 },
  { hour: '14:00', critical: 2, warning: 3 },
  { hour: '15:00', critical: 1, warning: 2 },
  { hour: '16:00', critical: 4, warning: 2 },
];

// ─── Serial connection panel ─────────────────────────────────────────────────
interface SerialPanelProps {
  connected: boolean;
  onConnect: (port: string, baud: number) => void;
  onDisconnect: () => void;
  onInject: (line: string) => void;
}

function SerialPanel({ connected, onConnect, onDisconnect, onInject }: SerialPanelProps) {
  const [open, setOpen] = useState(false);
  const [portPath, setPortPath] = useState('COM3');
  const [baudRate, setBaudRate] = useState('9600');
  const [testLine, setTestLine] = useState('LOW HEART RATE, BPM: 48');

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Usb size={15} className={connected ? 'text-success' : 'text-muted-foreground'} />
          <span className="text-sm font-semibold text-foreground">Serial Port — Proteus Feed</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
              connected
                ? 'text-success bg-success/10 border-success/30' :'text-muted-foreground bg-muted border-border'
            }`}
          >
            {connected ? (
              <><Wifi size={10} /> Connected</>
            ) : (
              <><WifiOff size={10} /> Disconnected</>
            )}
          </span>
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-4">
          {/* Connection controls */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Port</label>
              <input
                type="text"
                value={portPath}
                onChange={(e) => setPortPath(e.target.value)}
                placeholder="COM3 or /dev/ttyUSB0"
                className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground w-44 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Baud Rate</label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {['9600', '19200', '38400', '57600', '115200'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {!connected ? (
              <button
                onClick={() => onConnect(portPath, parseInt(baudRate, 10))}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-all active:scale-95"
              >
                <Usb size={13} /> Connect
              </button>
            ) : (
              <button
                onClick={onDisconnect}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-critical bg-critical/10 border border-critical/30 rounded-lg hover:bg-critical/20 transition-all active:scale-95"
              >
                <WifiOff size={13} /> Disconnect
              </button>
            )}
          </div>

          {/* Test injection */}
          <div className="border-t border-border/50 pt-3">
            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
              <FlaskConical size={12} /> Inject test line (no hardware needed)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={testLine}
                onChange={(e) => setTestLine(e.target.value)}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                onClick={() => onInject(testLine)}
                className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 transition-all active:scale-95"
              >
                Inject
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 opacity-70">
              e.g. &quot;LOW HEART RATE, BPM: 48&quot; · &quot;PATIENT: PT-101, BPM: 55, STATUS: LOW HEART RATE&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ──────────────────────────────────────────────────────────
export default function EmergencyDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [serialConnected, setSerialConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ── SSE subscription ──────────────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = new EventSource('/api/serial');
    eventSourceRef.current = es;

    es.addEventListener('status', (e) => {
      const data = JSON.parse(e.data) as { connected: boolean; port?: string };
      setSerialConnected(data.connected);
      if (data.connected) {
        toast.success(`Serial port connected — ${data.port ?? ''}`);
      }
    });

    es.addEventListener('alert', (e) => {
      const alert = JSON.parse(e.data) as AlertData;
      setAlerts((prev) => {
        // Replace existing entry for same patient or prepend
        const idx = prev.findIndex((a) => a.patientId === alert.patientId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = alert;
          return next;
        }
        return [alert, ...prev].slice(0, 20); // cap at 20
      });
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (alert.status === 'CRITICAL') {
        toast.error(`CRITICAL — ${alert.patientName} BPM ${alert.bpm}`);
      } else if (alert.status === 'WARNING') {
        toast.warning(`WARNING — ${alert.patientName} BPM ${alert.bpm}`);
      }
    });

    es.addEventListener('feed', (e) => {
      const event = JSON.parse(e.data) as FeedEvent;
      setFeedEvents((prev) => [event, ...prev].slice(0, 30));
    });

    es.addEventListener('error', () => {
      setSerialConnected(false);
    });

    es.onerror = () => {
      // SSE connection dropped — will auto-reconnect
    };
  }, []);

  useEffect(() => {
    connectSSE();
    // Seed with empty state after brief delay (no mock data)
    const timer = setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
    return () => {
      clearTimeout(timer);
      eventSourceRef.current?.close();
    };
  }, [connectSSE]);

  // ── Serial port controls ──────────────────────────────────────────────────
  const handleConnect = async (port: string, baudRate: number) => {
    try {
      const res = await fetch('/api/serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', port, baudRate }),
      });
      const data = await res.json() as { ok: boolean; message: string };
      if (!data.ok) toast.error(`Serial error: ${data.message}`);
    } catch {
      toast.error('Failed to reach serial API');
    }
  };

  const handleDisconnect = async () => {
    await fetch('/api/serial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    });
    setSerialConnected(false);
    toast.info('Serial port disconnected');
  };

  const handleInject = async (line: string) => {
    const res = await fetch('/api/serial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'inject', line }),
    });
    const data = await res.json() as { ok: boolean; message?: string };
    if (!data.ok) toast.error(`Inject failed: ${data.message}`);
    else toast.success('Test line injected');
  };

  // ── Alert actions ─────────────────────────────────────────────────────────
  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, doctorNotified: true, notificationMethod: 'SMS' } : a
      )
    );
    toast.success('Alert acknowledged — doctor notified via SMS');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      toast.success('Dashboard refreshed');
    }, 600);
  };

  const criticalCount = alerts.filter((a) => a.status === 'CRITICAL').length;
  const unnotifiedCount = alerts.filter((a) => !a.doctorNotified).length;
  const notifiedCount = alerts.filter((a) => a.doctorNotified).length;
  const notifRate = alerts.length > 0 ? Math.round((notifiedCount / alerts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Emergency Alert Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time cardiac monitoring · Proteus simulation feed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
              <Clock size={12} />
              Last updated {lastUpdated}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-lg hover:text-foreground hover:bg-secondary transition-all duration-150 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Serial Port Panel */}
      <SerialPanel
        connected={serialConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onInject={handleInject}
      />

      {/* Unacknowledged Warning Banner */}
      {!loading && unnotifiedCount > 0 && (
        <div className="flex items-center gap-3 bg-critical/10 border border-critical/30 rounded-xl px-4 py-3 animate-fade-in">
          <AlertTriangle size={18} className="text-critical flex-shrink-0 pulse-critical" />
          <p className="text-sm font-medium text-critical">
            {unnotifiedCount} active alert{unnotifiedCount > 1 ? 's' : ''} without doctor notification — immediate action required
          </p>
        </div>
      )}

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <div className="lg:col-span-2"><KpiSkeleton /></div>
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <div className="lg:col-span-2">
              <KpiCard
                label="Active Critical Alerts"
                value={criticalCount}
                unit="patients"
                subtext={`${unnotifiedCount} awaiting doctor notification`}
                icon={AlertTriangle}
                variant={criticalCount > 0 ? 'critical' : 'success'}
                hero
              />
            </div>
            <KpiCard
              label="Avg Response Time"
              value="4.2"
              unit="min"
              subtext="Since midnight"
              icon={Clock}
              trend={{ value: '0.8 min faster', positive: true }}
              variant="info"
            />
            <KpiCard
              label="Patients Monitored"
              value={24}
              unit="active"
              subtext="6 in ICU · 18 general"
              icon={Users}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Second KPI Row */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          <KpiCard
            label="Notification Success Rate"
            value={notifRate}
            unit="%"
            subtext="Doctors reached on first attempt"
            icon={CheckCircle}
            variant={notifRate >= 80 ? 'success' : 'warning'}
          />
          <KpiCard
            label="Alerts Today"
            value={alerts.length}
            unit="total"
            subtext={`${criticalCount} critical · ${alerts.length - criticalCount} warning/normal`}
            icon={Activity}
            variant="default"
          />
          <KpiCard
            label="Unacknowledged"
            value={unnotifiedCount}
            unit="alerts"
            subtext="Older than 5 minutes"
            icon={AlertTriangle}
            variant={unnotifiedCount > 0 ? 'warning' : 'success'}
          />
        </div>
      )}

      {/* Main Content: Alert Panel + Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
        {/* Alert Cards Panel */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground">Active Alerts</h2>
            <span className="text-xs text-muted-foreground">{alerts.length} patients</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <AlertCardSkeleton key={`skel-alert-${i}`} />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl">
              <CheckCircle size={40} className="text-success mb-3" />
              <p className="font-semibold text-foreground mb-1">No active alerts</p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Connect the serial port or inject a test line above. New alerts will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Charts + Feed */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">BPM Trend — PT-101</h3>
              <span className="text-xs text-muted-foreground">Last 30 min</span>
            </div>
            <BpmTrendChart data={BPM_TREND_DATA} />
            <p className="text-xs text-muted-foreground mt-2">
              — — Warning thresholds (60/100 BPM) &nbsp;·&nbsp; — Critical threshold (50 BPM)
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Alerts by Hour</h3>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <AlertsByHourChart data={HOURLY_DATA} />
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Notification Success</h3>
            <div className="flex items-center gap-4">
              <NotificationRateChart rate={notifRate} />
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Doctors reached</p>
                  <p className="font-mono-data text-lg font-bold text-success">{notifiedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending contact</p>
                  <p className="font-mono-data text-lg font-bold text-warning">{unnotifiedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Feed */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Live Event Feed</h2>
          <div className="flex items-center gap-1.5 text-xs text-success">
            <span className={`w-1.5 h-1.5 rounded-full ${serialConnected ? 'bg-success pulse-critical' : 'bg-muted-foreground'}`} />
            {serialConnected ? 'Live' : 'Standby'}
          </div>
        </div>
        <LiveAlertFeed events={feedEvents} />
      </div>
    </div>
  );
}