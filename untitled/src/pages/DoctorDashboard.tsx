import { useState, useEffect, useRef } from 'react';
import { Heart, AlertTriangle, MapPin, Clock, Volume2 } from 'lucide-react';

interface Measurement {
    id: string;
    bpm: number;
    status: string;
    location: string;
    timestamp: string;
    mapUrl: string;
}

export default function DoctorDashboard() {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [alerts, setAlerts] = useState<Measurement[]>([]);
    const [lastAlert, setLastAlert] = useState<Measurement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchMeasurements();
        connectWebSocket();
        const interval = setInterval(fetchMeasurements, 3000);
        return () => clearInterval(interval);
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const fetchMeasurements = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/measurements');
            const data = await response.json();
            setMeasurements(data);

            const emergencyAlerts = data.filter((m: Measurement) => m.status.includes('EMERGENCY') || m.status.includes('LOW'));
            setAlerts(emergencyAlerts);
        } catch (error) {
            console.error('Failed to fetch measurements:', error);
        }
    };

    const connectWebSocket = () => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsRef.current = new WebSocket(`${protocol}//localhost:8080/ws/alerts`);

            wsRef.current.onmessage = (event) => {
                const measurement: Measurement = JSON.parse(event.data);
                setMeasurements((prev) => [measurement, ...prev]);

                if (measurement.status.includes('EMERGENCY') || measurement.status.includes('LOW')) {
                    setAlerts((prev) => [measurement, ...prev]);
                    setLastAlert(measurement);
                    playAlert();
                }
            };

            wsRef.current.onerror = () => {
                console.error('WebSocket error, retrying...');
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket closed, reconnecting...');
                setTimeout(connectWebSocket, 3000);
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            setTimeout(connectWebSocket, 3000);
        }
    };

    const playAlert = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 880;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    const getAlertColor = (status: string) => {
        if (status.includes('EMERGENCY')) return 'from-red-500 to-red-600';
        return 'from-yellow-500 to-yellow-600';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <audio ref={audioRef} />

            <h2 className="text-3xl font-bold text-gray-900 mb-8">Doctor Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Measurements</p>
                            <p className="text-3xl font-bold text-gray-900">{measurements.length}</p>
                        </div>
                        <Heart className="w-10 h-10 text-blue-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Active Alerts</p>
                            <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
                        </div>
                        <AlertTriangle className="w-10 h-10 text-red-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Last Alert</p>
                            <p className="text-lg font-bold text-gray-900">
                                {lastAlert ? `${lastAlert.bpm} BPM` : 'None'}
                            </p>
                        </div>
                        <Clock className="w-10 h-10 text-orange-500 opacity-50" />
                    </div>
                </div>
            </div>

            {lastAlert && (
                <div className={`bg-gradient-to-r ${getAlertColor(lastAlert.status)} rounded-2xl text-white p-8 mb-8 shadow-2xl border-2 border-white`}>
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="w-12 h-12" />
                            <div>
                                <h3 className="text-2xl font-bold">PATIENT ALERT</h3>
                                <p className="text-white/90">{lastAlert.status}</p>
                            </div>
                        </div>
                        <button
                            onClick={playAlert}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition"
                            title="Play alert sound"
                        >
                            <Volume2 className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-white/70 text-sm mb-1">Heart Rate</p>
                            <p className="text-4xl font-bold">{lastAlert.bpm} BPM</p>
                        </div>
                        <div>
                            <p className="text-white/70 text-sm mb-1">Location</p>
                            <a
                                href={lastAlert.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg font-semibold hover:underline flex items-center gap-2"
                            >
                                <MapPin className="w-5 h-5" />
                                View on Map
                            </a>
                        </div>
                        <div>
                            <p className="text-white/70 text-sm mb-1">Time</p>
                            <p className="text-lg font-semibold">{new Date(lastAlert.timestamp).toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Emergency Alerts</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No active alerts</div>
                        ) : (
                            alerts.map((alert, idx) => (
                                <div key={idx} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition">
                                    <div className="flex items-start justify-between mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        alert.status.includes('EMERGENCY')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.status}
                    </span>
                                        <span className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-2">{alert.bpm} BPM</p>
                                    <a
                                        href={alert.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        {alert.location}
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Recent Measurements</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {measurements.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Waiting for measurements...</div>
                        ) : (
                            measurements.slice(0, 10).map((m, idx) => (
                                <div key={idx} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-2xl font-bold text-gray-900">{m.bpm} BPM</span>
                                        <span className="text-xs text-gray-500">{new Date(m.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${
                        m.status.includes('EMERGENCY')
                            ? 'text-red-600'
                            : m.status.includes('LOW')
                                ? 'text-yellow-600'
                                : m.status.includes('HIGH')
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                    }`}>
                      {m.status}
                    </span>
                                        <a href={m.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                            Map
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
