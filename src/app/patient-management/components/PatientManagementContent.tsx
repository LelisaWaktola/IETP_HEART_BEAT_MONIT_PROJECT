'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown,
  Users, AlertTriangle, Activity, UserCheck
} from 'lucide-react';

import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PatientForm from './PatientForm';
import { toast } from 'sonner';

// BACKEND INTEGRATION POINT: Replace with GET /api/patients and POST/PUT/DELETE endpoints

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  ward: string;
  room: string;
  assignedDoctor: string;
  minBpm: number;
  maxBpm: number;
  monitoringActive: boolean;
  lastReading: number;
  lastReadingTime: string;
  lastAlert: string | null;
}

const MOCK_PATIENTS: PatientRecord[] = [
  { id: 'PT-101', name: 'Yonas Tadesse', age: 67, ward: 'Cardiac ICU', room: '3A-12', assignedDoctor: 'Dr. Aisha Mengesha', minBpm: 55, maxBpm: 100, monitoringActive: true, lastReading: 48, lastReadingTime: '16:59', lastAlert: '16:59 — CRITICAL' },
  { id: 'PT-205', name: 'Fatima Al-Rashid', age: 58, ward: 'Step-Down Unit', room: '4C-8', assignedDoctor: 'Dr. Kebede Girma', minBpm: 60, maxBpm: 105, monitoringActive: true, lastReading: 112, lastReadingTime: '16:57', lastAlert: '16:57 — WARNING' },
  { id: 'PT-318', name: 'Marcos Oliveira', age: 74, ward: 'Cardiac ICU', room: '2B-5', assignedDoctor: 'Dr. Lena Wolff', minBpm: 55, maxBpm: 100, monitoringActive: true, lastReading: 44, lastReadingTime: '16:52', lastAlert: '16:52 — CRITICAL' },
  { id: 'PT-412', name: 'Chen Wei', age: 62, ward: 'General Cardiology', room: '1A-3', assignedDoctor: 'Dr. Aisha Mengesha', minBpm: 58, maxBpm: 110, monitoringActive: true, lastReading: 58, lastReadingTime: '16:41', lastAlert: '16:41 — WARNING' },
  { id: 'PT-089', name: 'Amara Diallo', age: 45, ward: 'Recovery', room: '5B-19', assignedDoctor: 'Dr. Lena Wolff', minBpm: 60, maxBpm: 100, monitoringActive: true, lastReading: 72, lastReadingTime: '16:48', lastAlert: '16:48 — NORMAL' },
  { id: 'PT-156', name: 'Nadia Petrov', age: 71, ward: 'Cardiac ICU', room: '3A-7', assignedDoctor: 'Dr. Kebede Girma', minBpm: 55, maxBpm: 100, monitoringActive: true, lastReading: 51, lastReadingTime: '16:35', lastAlert: '16:35 — CRITICAL' },
  { id: 'PT-223', name: 'Samuel Bekele', age: 55, ward: 'General Cardiology', room: '1B-11', assignedDoctor: 'Dr. Aisha Mengesha', minBpm: 60, maxBpm: 110, monitoringActive: true, lastReading: 88, lastReadingTime: '16:20', lastAlert: '14:15 — CRITICAL' },
  { id: 'PT-307', name: 'Ingrid Larsson', age: 69, ward: 'Step-Down Unit', room: '4A-2', assignedDoctor: 'Dr. Lena Wolff', minBpm: 58, maxBpm: 105, monitoringActive: false, lastReading: 78, lastReadingTime: '15:00', lastAlert: '13:42 — WARNING' },
  { id: 'PT-441', name: 'Ravi Shankar', age: 63, ward: 'Cardiac ICU', room: '2A-9', assignedDoctor: 'Dr. Kebede Girma', minBpm: 55, maxBpm: 100, monitoringActive: true, lastReading: 65, lastReadingTime: '16:55', lastAlert: '12:08 — CRITICAL' },
  { id: 'PT-188', name: 'Emilia Santos', age: 50, ward: 'Recovery', room: '5C-4', assignedDoctor: 'Dr. Aisha Mengesha', minBpm: 60, maxBpm: 110, monitoringActive: false, lastReading: 82, lastReadingTime: '14:30', lastAlert: '11:55 — NORMAL' },
  { id: 'PT-365', name: 'Kwame Asante', age: 57, ward: 'General Cardiology', room: '1C-6', assignedDoctor: 'Dr. Lena Wolff', minBpm: 60, maxBpm: 110, monitoringActive: true, lastReading: 95, lastReadingTime: '16:50', lastAlert: '10:30 — WARNING' },
  { id: 'PT-492', name: 'Yuki Tanaka', age: 78, ward: 'Cardiac ICU', room: '2C-1', assignedDoctor: 'Dr. Kebede Girma', minBpm: 55, maxBpm: 100, monitoringActive: true, lastReading: 61, lastReadingTime: '16:45', lastAlert: '09:17 — CRITICAL' },
];

type SortKey = keyof PatientRecord;

export default function PatientManagementContent() {
  const [patients, setPatients] = useState<PatientRecord[]>(MOCK_PATIENTS);
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [monitorFilter, setMonitorFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<PatientRecord | null>(null);
  const [deletePatient, setDeletePatient] = useState<PatientRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-muted-foreground" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const wards = useMemo(() => Array.from(new Set(MOCK_PATIENTS.map((p) => p.ward))), []);

  const filtered = useMemo(() => {
    let data = patients.filter((p) => {
      const q = search.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q) && !p.ward.toLowerCase().includes(q)) return false;
      if (wardFilter !== 'ALL' && p.ward !== wardFilter) return false;
      if (monitorFilter === 'ACTIVE' && !p.monitoringActive) return false;
      if (monitorFilter === 'INACTIVE' && p.monitoringActive) return false;
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
  }, [patients, search, wardFilter, monitorFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleToggleMonitoring = (id: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, monitoringActive: !p.monitoringActive } : p))
    );
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      toast.success(`Monitoring ${patient.monitoringActive ? 'paused' : 'resumed'} for ${patient.name}`);
    }
  };

  const handleSavePatient = (data: PatientRecord) => {
    if (editPatient) {
      setPatients((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      toast.success(`Patient record updated for ${data.name}`);
    } else {
      setPatients((prev) => [...prev, { ...data, id: `PT-${String(Math.floor(Math.random() * 900) + 100)}` }]);
      toast.success(`${data.name} added to monitoring`);
    }
    setAddModalOpen(false);
    setEditPatient(null);
  };

  const handleConfirmDelete = () => {
    if (!deletePatient) return;
    setDeleteLoading(true);
    // BACKEND INTEGRATION POINT: DELETE /api/patients/:id
    setTimeout(() => {
      setPatients((prev) => prev.filter((p) => p.id !== deletePatient.id));
      toast.success(`${deletePatient.name} removed from monitoring`);
      setDeletePatient(null);
      setDeleteLoading(false);
    }, 700);
  };

  const activeCount = patients.filter((p) => p.monitoringActive).length;
  const icuCount = patients.filter((p) => p.ward === 'Cardiac ICU').length;
  const criticalNow = patients.filter((p) => p.lastReading < 50 || p.lastReading > 120).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Patient Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage monitored patients, thresholds, and doctor assignments</p>
        </div>
        <button
          onClick={() => { setEditPatient(null); setAddModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95"
        >
          <Plus size={15} />
          Add Patient
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-info" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Patients</p>
            <p className="font-mono-data text-xl font-bold text-foreground">{patients.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
            <Activity size={16} className="text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Monitoring</p>
            <p className="font-mono-data text-xl font-bold text-success">{activeCount}</p>
          </div>
        </div>
        <div className="card-critical rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-critical/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-critical" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Critical BPM Now</p>
            <p className="font-mono-data text-xl font-bold text-critical">{criticalNow}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
            <UserCheck size={16} className="text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ICU Patients</p>
            <p className="font-mono-data text-xl font-bold text-warning">{icuCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or ward…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
            />
          </div>
          <select
            value={wardFilter}
            onChange={(e) => { setWardFilter(e.target.value); setPage(1); }}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
          >
            <option value="ALL">All Wards</option>
            {wards.map((w) => (
              <option key={`ward-${w}`} value={w}>{w}</option>
            ))}
          </select>
          <select
            value={monitorFilter}
            onChange={(e) => { setMonitorFilter(e.target.value); setPage(1); }}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Monitoring Active</option>
            <option value="INACTIVE">Monitoring Paused</option>
          </select>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} patients</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  { key: 'id' as SortKey, label: 'Patient ID', mono: true },
                  { key: 'name' as SortKey, label: 'Name', mono: false },
                  { key: 'age' as SortKey, label: 'Age', mono: true },
                  { key: 'ward' as SortKey, label: 'Ward / Room', mono: false },
                  { key: 'assignedDoctor' as SortKey, label: 'Assigned Doctor', mono: false },
                  { key: 'minBpm' as SortKey, label: 'Min BPM', mono: true },
                  { key: 'maxBpm' as SortKey, label: 'Max BPM', mono: true },
                  { key: 'monitoringActive' as SortKey, label: 'Monitoring', mono: false },
                  { key: 'lastReading' as SortKey, label: 'Last BPM', mono: true },
                  { key: 'lastAlert' as SortKey, label: 'Last Alert', mono: false },
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Users size={40} className="text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold text-foreground">No patients found</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Add a patient to begin monitoring their cardiac data from Proteus simulation output.
                    </p>
                    <button
                      onClick={() => setAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95"
                    >
                      <Plus size={14} />
                      Add First Patient
                    </button>
                  </td>
                </tr>
              ) : (
                paginated.map((patient, idx) => (
                  <tr
                    key={patient.id}
                    className={`border-b border-border hover:bg-muted/40 transition-colors duration-100 group ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-xs text-muted-foreground">{patient.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground whitespace-nowrap">{patient.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-sm text-foreground">{patient.age}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground whitespace-nowrap">{patient.ward}</p>
                        <p className="text-xs text-muted-foreground font-mono-data">Room {patient.room}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground whitespace-nowrap">{patient.assignedDoctor}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-sm font-medium text-warning">{patient.minBpm}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-sm font-medium text-warning">{patient.maxBpm}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleMonitoring(patient.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background ${
                          patient.monitoringActive ? 'bg-success' : 'bg-muted-foreground/40'
                        }`}
                        role="switch"
                        aria-checked={patient.monitoringActive}
                        title={patient.monitoringActive ? 'Pause monitoring' : 'Resume monitoring'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            patient.monitoringActive ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono-data text-sm font-bold ${
                        patient.lastReading < 50 || patient.lastReading > 120 ? 'text-critical' :
                        patient.lastReading < 60 || patient.lastReading > 100 ? 'text-warning' : 'text-success'
                      }`}>
                        {patient.lastReading}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1 font-mono-data">@{patient.lastReadingTime}</span>
                    </td>
                    <td className="px-4 py-3">
                      {patient.lastAlert ? (
                        <span className={`text-xs font-mono-data ${
                          patient.lastAlert.includes('CRITICAL') ? 'text-critical' :
                          patient.lastAlert.includes('WARNING') ? 'text-warning' : 'text-muted-foreground'
                        }`}>
                          {patient.lastAlert}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => { setEditPatient(patient); setAddModalOpen(true); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-info hover:bg-info/10 transition-all duration-150"
                          title="Edit patient record"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletePatient(patient)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-critical hover:bg-critical/10 transition-all duration-150"
                          title="Remove patient from monitoring — this cannot be undone"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <span className="text-xs text-muted-foreground">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} patients
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={`pg-${p}`}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-md border transition-all duration-150 ${
                    page === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditPatient(null); }}
        title={editPatient ? 'Edit Patient Record' : 'Add New Patient'}
        subtitle={editPatient ? `Updating record for ${editPatient.name}` : 'Register a new patient for cardiac monitoring'}
        size="lg"
      >
        <PatientForm
          initial={editPatient}
          onSave={handleSavePatient}
          onCancel={() => { setAddModalOpen(false); setEditPatient(null); }}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deletePatient}
        onClose={() => setDeletePatient(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Patient from Monitoring"
        description={`This will permanently remove ${deletePatient?.name} (${deletePatient?.id}) from the monitoring system and delete all associated alert configurations. Historical alert records will be preserved in the audit log.`}
        confirmLabel="Remove Patient"
        loading={deleteLoading}
      />
    </div>
  );
}