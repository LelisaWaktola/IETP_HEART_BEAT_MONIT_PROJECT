'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Download, ChevronUp, ChevronDown, ChevronsUpDown,
  AlertTriangle, CheckCircle, Clock, Phone, Mail, MessageSquare
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';

// BACKEND INTEGRATION POINT: Replace with GET /api/alerts?page=X&status=Y&from=Z&to=W
interface AlertRecord {
  id: string;
  patientName: string;
  patientId: string;
  bpm: number;
  status: 'CRITICAL' | 'WARNING' | 'NORMAL';
  alertTime: string;
  doctorName: string;
  notificationMethod: 'SMS' | 'Email' | 'Both' | 'None';
  responseTimeMin: number;
  resolution: 'RESOLVED' | 'PENDING' | 'ESCALATED';
}

const MOCK_HISTORY: AlertRecord[] = [
  { id: 'ALT-2026-0847', patientName: 'Yonas Tadesse', patientId: 'PT-101', bpm: 48, status: 'CRITICAL', alertTime: '2026-05-18T16:59:00Z', doctorName: 'Aisha Mengesha', notificationMethod: 'SMS', responseTimeMin: 1, resolution: 'PENDING' },
  { id: 'ALT-2026-0848', patientName: 'Marcos Oliveira', patientId: 'PT-318', bpm: 44, status: 'CRITICAL', alertTime: '2026-05-18T16:52:00Z', doctorName: 'Lena Wolff', notificationMethod: 'None', responseTimeMin: 0, resolution: 'PENDING' },
  { id: 'ALT-2026-0849', patientName: 'Fatima Al-Rashid', patientId: 'PT-205', bpm: 112, status: 'WARNING', alertTime: '2026-05-18T16:57:00Z', doctorName: 'Kebede Girma', notificationMethod: 'Email', responseTimeMin: 3, resolution: 'PENDING' },
  { id: 'ALT-2026-0850', patientName: 'Chen Wei', patientId: 'PT-412', bpm: 58, status: 'WARNING', alertTime: '2026-05-18T16:41:00Z', doctorName: 'Aisha Mengesha', notificationMethod: 'Both', responseTimeMin: 2, resolution: 'RESOLVED' },
  { id: 'ALT-2026-0851', patientName: 'Amara Diallo', patientId: 'PT-089', bpm: 72, status: 'NORMAL', alertTime: '2026-05-18T16:48:00Z', doctorName: 'Lena Wolff', notificationMethod: 'Email', responseTimeMin: 4, resolution: 'RESOLVED' },
  { id: 'ALT-2026-0846', patientName: 'Nadia Petrov', patientId: 'PT-156', bpm: 51, status: 'CRITICAL', alertTime: '2026-05-18T15:30:00Z', doctorName: 'Kebede Girma', notificationMethod: 'SMS', responseTimeMin: 2, resolution: 'RESOLVED' },
  { id: 'ALT-2026-0845', patientName: 'Samuel Bekele', patientId: 'PT-223', bpm: 128, status: 'CRITICAL', alertTime: '2026-05-18T14:15:00Z', doctorName: 'Aisha Mengesha', notificationMethod: 'Both', responseTimeMin: 3, resolution: 'RESOLVED' },
  { id: 'ALT-2026-0844', patientName: 'Ingrid Larsson', patientId: 'PT-307', bpm: 105, status: 'WARNING', alertTime: '2026-05-18T13:42:00Z', doctorName: 'Lena Wolff', notificationMethod: 'Email', responseTimeMin: 5, resolution: 'RESOLVED' },
  { id: 'ALT-2026-0843', patientName: 'Ravi Shankar', patientId: 'PT-441', bpm: 46, status: 'CRITICAL', alertTime: '2026-05-18T12:08:00Z', doctorName: 'Kebede Girma', notificationMethod: 'SMS', responseTimeMin: 2, resolution: 'ESCALATED' },
  { id: 'ALT-2026-0842', patientName: 'Emilia Santos', patientId: 'PT-188', bpm: 62, status: 'NORMAL', alertTime: '2026-05-18T11:55:00Z', doctorName: 'Aisha Mengesha', notificationMethod: 'Email', responseTimeMin: 6, resolution: 'RESOLVED' },
  { id: 'ALT-2026-0841', patientName: 'Kwame Asante', patientId: 'PT-365', bpm: 118, status: 'WARNING', alertTime: '2026-05-18T10:30:00Z', doctorName: 'Lena Wolff', notificationMethod: 'Both', responseTimeMin: 4, resolution: 'RESOLVED' },
  { id: 'ALT-2026-0840', patientName: 'Yuki Tanaka', patientId: 'PT-492', bpm: 42, status: 'CRITICAL', alertTime: '2026-05-18T09:17:00Z', doctorName: 'Kebede Girma', notificationMethod: 'SMS', responseTimeMin: 1, resolution: 'RESOLVED' },
];

type SortKey = keyof AlertRecord;
type SortDir = 'asc' | 'desc';

const METHOD_ICONS: Record<string, React.ReactNode> = {
  SMS: <Phone size={12} />,
  Email: <Mail size={12} />,
  Both: <MessageSquare size={12} />,
  None: null,
};

function formatAlertTime(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

export default function AlertHistoryContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('alertTime');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-muted-foreground" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const filtered = useMemo(() => {
    let data = MOCK_HISTORY.filter((r) => {
      const q = search.toLowerCase();
      if (q && !r.patientName.toLowerCase().includes(q) && !r.patientId.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (methodFilter !== 'ALL' && r.notificationMethod !== methodFilter) return false;
      return true;
    });
    data = [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === undefined || bv === undefined) return 0;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [search, statusFilter, methodFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const todayAlerts = MOCK_HISTORY.length;
  const avgResponse = (MOCK_HISTORY.reduce((s, r) => s + r.responseTimeMin, 0) / MOCK_HISTORY.length).toFixed(1);
  const criticalToday = MOCK_HISTORY.filter((r) => r.status === 'CRITICAL').length;
  const warningToday = MOCK_HISTORY.filter((r) => r.status === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Alert History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Audit trail of all cardiac alert events</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-muted border border-border text-muted-foreground rounded-lg hover:text-foreground hover:bg-secondary transition-all duration-150 active:scale-95">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Alerts Today</p>
          <p className="font-mono-data text-2xl font-bold text-foreground">{todayAlerts}</p>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Avg Response</p>
          <p className="font-mono-data text-2xl font-bold text-info">{avgResponse}<span className="text-sm font-normal text-muted-foreground ml-1">min</span></p>
        </div>
        <div className="card-critical rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Critical</p>
          <p className="font-mono-data text-2xl font-bold text-critical">{criticalToday}</p>
        </div>
        <div className="card-warning rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Warning</p>
          <p className="font-mono-data text-2xl font-bold text-warning">{warningToday}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by patient, ID, or alert…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-150"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
          >
            <option value="ALL">All Methods</option>
            <option value="SMS">SMS</option>
            <option value="Email">Email</option>
            <option value="Both">Both</option>
            <option value="None">None</option>
          </select>

          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  { key: 'id' as SortKey, label: 'Alert ID', mono: true },
                  { key: 'patientName' as SortKey, label: 'Patient', mono: false },
                  { key: 'patientId' as SortKey, label: 'Patient ID', mono: true },
                  { key: 'bpm' as SortKey, label: 'BPM', mono: true },
                  { key: 'status' as SortKey, label: 'Status', mono: false },
                  { key: 'alertTime' as SortKey, label: 'Alert Time', mono: true },
                  { key: 'doctorName' as SortKey, label: 'Doctor', mono: false },
                  { key: 'notificationMethod' as SortKey, label: 'Method', mono: false },
                  { key: 'responseTimeMin' as SortKey, label: 'Response (min)', mono: true },
                  { key: 'resolution' as SortKey, label: 'Resolution', mono: false },
                ].map(({ key, label, mono }) => (
                  <th
                    key={`th-${key}`}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={mono ? 'font-mono-data' : ''}>{label}</span>
                      <SortIcon col={key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={`skel-row-${i}`} cols={10} />
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <AlertTriangle size={32} className="text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold text-foreground">No alerts match your filters</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting the search or filter criteria</p>
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-border hover:bg-muted/40 transition-colors duration-100 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs text-muted-foreground">{row.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground whitespace-nowrap">{row.patientName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs text-muted-foreground">{row.patientId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono-data font-bold text-sm ${
                        row.bpm < 50 || row.bpm > 120 ? 'text-critical' :
                        row.bpm < 60 || row.bpm > 100 ? 'text-warning' : 'text-success'
                      }`}>
                        {row.bpm}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs text-foreground whitespace-nowrap">
                        {formatAlertTime(row.alertTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground whitespace-nowrap">{row.doctorName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2 py-0.5 ${
                        row.notificationMethod === 'None' ?'bg-muted text-muted-foreground border border-border'
                          : row.notificationMethod === 'Both' ?'bg-info/15 text-info border border-info/30' :'bg-muted text-foreground border border-border'
                      }`}>
                        {METHOD_ICONS[row.notificationMethod]}
                        {row.notificationMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono-data text-sm font-bold ${
                        row.responseTimeMin === 0 ? 'text-critical' :
                        row.responseTimeMin <= 3 ? 'text-success' : 'text-warning'
                      }`}>
                        {row.responseTimeMin === 0 ? '—' : row.responseTimeMin}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.resolution === 'RESOLVED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 border border-success/30 rounded-full px-2 py-0.5">
                          <CheckCircle size={10} />Resolved
                        </span>
                      )}
                      {row.resolution === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 border border-warning/30 rounded-full px-2 py-0.5">
                          <Clock size={10} />Pending
                        </span>
                      )}
                      {row.resolution === 'ESCALATED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-critical bg-critical/10 border border-critical/30 rounded-full px-2 py-0.5">
                          <AlertTriangle size={10} />Escalated
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-input border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {[10, 25, 50].map((n) => (
                <option key={`ps-${n}`} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={`page-${item}`}
                    onClick={() => setPage(item as number)}
                    className={`w-7 h-7 text-xs rounded-md border transition-all duration-150 ${
                      page === item
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}