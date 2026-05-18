/**
 * Serial Port API — /api/serial
 *
 * GET  /api/serial          → SSE stream of parsed Proteus alerts
 * POST /api/serial          → Start/stop the serial port listener
 *                             body: { action: "start"|"stop", port?: string, baudRate?: number }
 *
 * Proteus output format examples:
 *   LOW HEART RATE, BPM: 48
 *   HIGH HEART RATE, BPM: 135
 *   NORMAL HEART RATE, BPM: 72
 *   PATIENT: PT-101, BPM: 48, STATUS: LOW HEART RATE
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Shared in-process state ────────────────────────────────────────────────
// We keep a single SerialPort instance and a list of SSE response controllers
// so every connected browser tab receives the same events.

interface ParsedAlert {
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
  rawLine: string;
}

interface SerialState {
  port: unknown | null;
  isOpen: boolean;
  controllers: Set<ReadableStreamDefaultController>;
  alertCounter: number;
}

// Attach to globalThis so it survives Next.js hot-reloads in dev
const g = globalThis as typeof globalThis & { __serialState?: SerialState };
if (!g.__serialState) {
  g.__serialState = {
    port: null,
    isOpen: false,
    controllers: new Set(),
    alertCounter: 1000,
  };
}
const state = g.__serialState;

// ─── Helpers ────────────────────────────────────────────────────────────────

function nextAlertId(): string {
  state.alertCounter += 1;
  return `ALT-2026-${state.alertCounter}`;
}

/** Broadcast a JSON event to every connected SSE client */
function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const ctrl of state.controllers) {
    try {
      ctrl.enqueue(new TextEncoder().encode(payload));
    } catch {
      state.controllers.delete(ctrl);
    }
  }
}

/**
 * Parse a raw Proteus serial line into a structured alert.
 *
 * Supported formats:
 *  1. "LOW HEART RATE, BPM: 48" *  2."HIGH HEART RATE, BPM: 135" *  3."NORMAL HEART RATE, BPM: 72" *  4."PATIENT: PT-101, BPM: 48, STATUS: LOW HEART RATE" *  5."BPM: 72"  (bare reading)
 */
function parseLine(line: string): ParsedAlert | null {
  const trimmed = line.trim().toUpperCase();
  if (!trimmed) return null;

  let bpm: number | null = null;
  let statusText = 'NORMAL HEART RATE';
  let patientId = 'PT-000';

  // Format 4: PATIENT: PT-xxx, BPM: nn, STATUS: ...
  const fullMatch = trimmed.match(
    /PATIENT:\s*(PT-\d+),\s*BPM:\s*(\d+),\s*STATUS:\s*(.+)/
  );
  if (fullMatch) {
    patientId = fullMatch[1];
    bpm = parseInt(fullMatch[2], 10);
    statusText = fullMatch[3].trim();
  } else {
    // Format 1-3: "LOW HEART RATE, BPM: 48"
    const bpmMatch = trimmed.match(/BPM:\s*(\d+)/);
    if (bpmMatch) bpm = parseInt(bpmMatch[1], 10);

    if (trimmed.includes('LOW')) statusText = 'LOW HEART RATE';
    else if (trimmed.includes('HIGH')) statusText = 'HIGH HEART RATE';
    else statusText = 'NORMAL HEART RATE';
  }

  if (bpm === null || isNaN(bpm)) return null;

  // Derive severity
  let status: 'CRITICAL' | 'WARNING' | 'NORMAL';
  if (bpm < 50 || bpm > 130) status = 'CRITICAL';
  else if (bpm < 60 || bpm > 100) status = 'WARNING';
  else status = 'NORMAL';

  // Static patient roster (mirrors mock data; extend as needed)
  const PATIENT_ROSTER: Record<string, { name: string; ward: string; age: number; doctor: string; lat: number; lng: number; label: string }> = {
    'PT-101': { name: 'Yonas Tadesse',    ward: 'Cardiac ICU',       age: 67, doctor: 'Aisha Mengesha', lat: 9.030, lng: 38.740, label: 'Ward 3A, Bed 12' },
    'PT-318': { name: 'Marcos Oliveira',  ward: 'Cardiac ICU',       age: 74, doctor: 'Lena Wolff',     lat: 9.031, lng: 38.742, label: 'Ward 2B, Bed 5'  },
    'PT-205': { name: 'Fatima Al-Rashid', ward: 'Step-Down Unit',    age: 58, doctor: 'Kebede Girma',   lat: 9.028, lng: 38.738, label: 'Ward 4C, Bed 8'  },
    'PT-412': { name: 'Chen Wei',         ward: 'General Cardiology', age: 62, doctor: 'Aisha Mengesha', lat: 9.025, lng: 38.745, label: 'Ward 1A, Bed 3'  },
    'PT-089': { name: 'Amara Diallo',     ward: 'Recovery',          age: 45, doctor: 'Lena Wolff',     lat: 9.033, lng: 38.741, label: 'Ward 5B, Bed 19' },
    'PT-156': { name: 'Nadia Petrov',     ward: 'Cardiac ICU',       age: 71, doctor: 'Kebede Girma',   lat: 9.029, lng: 38.743, label: 'Ward 3A, Bed 7'  },
  };

  const patient = PATIENT_ROSTER[patientId] ?? {
    name: `Patient ${patientId}`,
    ward: 'Unknown Ward',
    age: 0,
    doctor: 'On-Call Doctor',
    lat: 9.030,
    lng: 38.740,
    label: 'Unknown Location',
  };

  return {
    id: nextAlertId(),
    patientId,
    patientName: patient.name,
    bpm,
    status,
    timestamp: new Date().toISOString(),
    location: { lat: patient.lat, lng: patient.lng, label: patient.label },
    doctorNotified: false,
    doctorName: patient.doctor,
    notificationMethod: null,
    ward: patient.ward,
    age: patient.age,
    rawLine: line.trim(),
  };
}

// ─── Serial port lifecycle ───────────────────────────────────────────────────

async function openPort(portPath: string, baudRate: number) {
  if (state.isOpen) return { ok: true, message: 'Already open' };

  try {
    // Dynamic import so the module is only loaded server-side
    const { SerialPort } = await import('serialport');
    const { ReadlineParser } = await import('@serialport/parser-readline');

    const sp = new SerialPort({ path: portPath, baudRate, autoOpen: false });

    await new Promise<void>((resolve, reject) => {
      sp.open((err) => (err ? reject(err) : resolve()));
    });

    const parser = sp.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', (line: string) => {
      const alert = parseLine(line);
      if (alert) {
        broadcast('alert', alert);
        broadcast('feed', {
          id: `feed-${Date.now()}`,
          type: alert.status === 'NORMAL' ? 'RESOLVED' : alert.status,
          message: `${alert.patientId} ${alert.patientName} — BPM ${alert.bpm} · ${alert.rawLine}`,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    sp.on('error', (err: Error) => {
      broadcast('error', { message: err.message });
      state.isOpen = false;
      state.port = null;
    });

    sp.on('close', () => {
      broadcast('status', { connected: false, port: portPath });
      state.isOpen = false;
      state.port = null;
    });

    state.port = sp;
    state.isOpen = true;
    broadcast('status', { connected: true, port: portPath, baudRate });
    return { ok: true, message: `Opened ${portPath} at ${baudRate} baud` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: msg };
  }
}

async function closePort() {
  if (!state.isOpen || !state.port) return { ok: true, message: 'Already closed' };
  try {
    const sp = state.port as { close: (cb: (e: Error | null) => void) => void };
    await new Promise<void>((resolve, reject) => {
      sp.close((err) => (err ? reject(err) : resolve()));
    });
    state.port = null;
    state.isOpen = false;
    return { ok: true, message: 'Port closed' };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Route handlers ──────────────────────────────────────────────────────────

/** GET /api/serial  →  SSE stream */
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      state.controllers.add(controller);

      // Send current connection status immediately
      const statusPayload = `event: status\ndata: ${JSON.stringify({ connected: state.isOpen })}\n\n`;
      controller.enqueue(new TextEncoder().encode(statusPayload));

      // Heartbeat every 15 s to keep the connection alive
      const hb = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch {
          clearInterval(hb);
          state.controllers.delete(controller);
        }
      }, 15000);
    },
    cancel(controller) {
      state.controllers.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

/** POST /api/serial  →  start / stop / inject (for testing) */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action, port = 'COM3', baudRate = 9600, line } = body as {
    action: string;
    port?: string;
    baudRate?: number;
    line?: string;
  };

  if (action === 'start') {
    const result = await openPort(port, baudRate);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  }

  if (action === 'stop') {
    const result = await closePort();
    return NextResponse.json(result);
  }

  if (action === 'status') {
    return NextResponse.json({ connected: state.isOpen });
  }

  // Inject a raw line for testing without real hardware
  if (action === 'inject' && line) {
    const alert = parseLine(line);
    if (alert) {
      broadcast('alert', alert);
      broadcast('feed', {
        id: `feed-${Date.now()}`,
        type: alert.status === 'NORMAL' ? 'RESOLVED' : alert.status,
        message: `${alert.patientId} ${alert.patientName} — BPM ${alert.bpm} · ${alert.rawLine}`,
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      });
      return NextResponse.json({ ok: true, alert });
    }
    return NextResponse.json({ ok: false, message: 'Could not parse line' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
