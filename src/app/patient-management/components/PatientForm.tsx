'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PatientRecord } from './PatientManagementContent';

const DOCTORS = [
  'Dr. Aisha Mengesha',
  'Dr. Kebede Girma',
  'Dr. Lena Wolff',
  'Dr. Omar Farouk',
  'Dr. Priya Nair',
];

const WARDS = [
  'Cardiac ICU',
  'Step-Down Unit',
  'General Cardiology',
  'Recovery',
  'Emergency',
];

interface PatientFormProps {
  initial: PatientRecord | null;
  onSave: (data: PatientRecord) => void;
  onCancel: () => void;
}

type FormValues = Omit<PatientRecord, 'id' | 'lastReading' | 'lastReadingTime' | 'lastAlert'> & {
  monitoringActive: boolean;
};

export default function PatientForm({ initial, onSave, onCancel }: PatientFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: initial?.name ?? '',
      age: initial?.age ?? undefined,
      ward: initial?.ward ?? WARDS[0],
      room: initial?.room ?? '',
      assignedDoctor: initial?.assignedDoctor ?? DOCTORS[0],
      minBpm: initial?.minBpm ?? 55,
      maxBpm: initial?.maxBpm ?? 100,
      monitoringActive: initial?.monitoringActive ?? true,
    },
  });

  const onSubmit = (values: FormValues) => {
    setSubmitting(true);
    // BACKEND INTEGRATION POINT: POST /api/patients or PUT /api/patients/:id
    setTimeout(() => {
      const record: PatientRecord = {
        id: initial?.id ?? '',
        ...values,
        lastReading: initial?.lastReading ?? 0,
        lastReadingTime: initial?.lastReadingTime ?? '—',
        lastAlert: initial?.lastAlert ?? null,
      };
      onSave(record);
      setSubmitting(false);
    }, 600);
  };

  const inputClass =
    'w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-150';
  const errorClass = 'text-xs text-critical mt-1';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';
  const helperClass = 'text-xs text-muted-foreground mt-0.5';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Section: Patient Info */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 pb-2 border-b border-border">
          Patient Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={labelClass}>Full Name <span className="text-critical">*</span></label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Yonas Tadesse"
              className={inputClass}
              {...register('name', { required: 'Patient name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="age" className={labelClass}>Age <span className="text-critical">*</span></label>
            <input
              id="age"
              type="number"
              placeholder="e.g. 67"
              className={inputClass}
              {...register('age', {
                required: 'Age is required',
                min: { value: 1, message: 'Age must be at least 1' },
                max: { value: 120, message: 'Age must be under 120' },
                valueAsNumber: true,
              })}
            />
            {errors.age && <p className={errorClass}>{errors.age.message}</p>}
          </div>

          <div>
            <label htmlFor="room" className={labelClass}>Room Number <span className="text-critical">*</span></label>
            <input
              id="room"
              type="text"
              placeholder="e.g. 3A-12"
              className={inputClass}
              {...register('room', { required: 'Room number is required' })}
            />
            <p className={helperClass}>Ward section and bed number</p>
            {errors.room && <p className={errorClass}>{errors.room.message}</p>}
          </div>

          <div>
            <label htmlFor="ward" className={labelClass}>Ward <span className="text-critical">*</span></label>
            <select
              id="ward"
              className={inputClass}
              {...register('ward', { required: 'Ward is required' })}
            >
              {WARDS.map((w) => (
                <option key={`ward-opt-${w}`} value={w}>{w}</option>
              ))}
            </select>
            {errors.ward && <p className={errorClass}>{errors.ward.message}</p>}
          </div>

          <div>
            <label htmlFor="assignedDoctor" className={labelClass}>Assigned Doctor <span className="text-critical">*</span></label>
            <select
              id="assignedDoctor"
              className={inputClass}
              {...register('assignedDoctor', { required: 'Doctor assignment is required' })}
            >
              {DOCTORS.map((d) => (
                <option key={`doc-opt-${d}`} value={d}>{d}</option>
              ))}
            </select>
            <p className={helperClass}>Doctor receives SMS/email when alert triggers</p>
            {errors.assignedDoctor && <p className={errorClass}>{errors.assignedDoctor.message}</p>}
          </div>
        </div>
      </div>

      {/* Section: BPM Thresholds */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 pb-2 border-b border-border">
          Alert Thresholds
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          An alert triggers when the patient&apos;s BPM falls below the minimum or exceeds the maximum threshold.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minBpm" className={labelClass}>
              Minimum BPM <span className="text-critical">*</span>
            </label>
            <input
              id="minBpm"
              type="number"
              placeholder="e.g. 55"
              className={inputClass}
              {...register('minBpm', {
                required: 'Minimum BPM is required',
                min: { value: 20, message: 'Minimum BPM must be at least 20' },
                max: { value: 80, message: 'Minimum BPM must be below 80' },
                valueAsNumber: true,
              })}
            />
            <p className={helperClass}>Alert triggers if BPM drops below this</p>
            {errors.minBpm && <p className={errorClass}>{errors.minBpm.message}</p>}
          </div>

          <div>
            <label htmlFor="maxBpm" className={labelClass}>
              Maximum BPM <span className="text-critical">*</span>
            </label>
            <input
              id="maxBpm"
              type="number"
              placeholder="e.g. 100"
              className={inputClass}
              {...register('maxBpm', {
                required: 'Maximum BPM is required',
                min: { value: 80, message: 'Maximum BPM must be at least 80' },
                max: { value: 200, message: 'Maximum BPM must be below 200' },
                valueAsNumber: true,
              })}
            />
            <p className={helperClass}>Alert triggers if BPM exceeds this</p>
            {errors.maxBpm && <p className={errorClass}>{errors.maxBpm.message}</p>}
          </div>
        </div>
      </div>

      {/* Section: Monitoring */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 pb-2 border-b border-border">
          Monitoring Settings
        </p>
        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Activate Monitoring</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Begin receiving BPM readings from Proteus simulation output immediately
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register('monitoringActive')}
            />
            <div className="w-9 h-5 bg-muted-foreground/40 peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:bg-success transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform after:duration-200 peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      {/* Required fields note */}
      <p className="text-xs text-muted-foreground mb-4">
        <span className="text-critical">*</span> Required fields
      </p>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 border border-border"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || (!isDirty && !!initial)}
          className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95 disabled:opacity-60 flex items-center gap-2 min-w-[130px] justify-center"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : initial ? (
            'Save Changes'
          ) : (
            'Add Patient'
          )}
        </button>
      </div>
    </form>
  );
}