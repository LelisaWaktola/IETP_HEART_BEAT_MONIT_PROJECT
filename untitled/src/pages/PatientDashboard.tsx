import { useState, useEffect } from 'react';
import { Heart, Activity, TrendingUp } from 'lucide-react';

interface Measurement {
    id: string;
    bpm: number;
    status: string;
    location: string;
    timestamp: string;
    mapUrl: string;
}

export default function PatientDashboard() {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastMeasurement, setLastMeasurement] = useState<Measurement | null>(null);

    useEffect(() => {
        fetchMeasurements();
        const interval = setInterval(fetchMeasurements, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchMeasurements = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/measurements');
            const data = await response.json();
            setMeasurements(data);
            if (data.length > 0) {
                setLastMeasurement(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch measurements:', error);
        }
    };

    const getStatusColor = (status: string) => {
        if (status.includes('EMERGENCY')) return 'bg-red-100 text-red-800 border-red-300';
        if (status.includes('LOW')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (status.includes('HIGH')) return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-green-100 text-green-800 border-green-300';
    };

    const getStatusBgColor = (status: string) => {
        if (status.includes('EMERGENCY')) return 'from-red-50 to-red-100';
        if (status.includes('LOW')) return 'from-yellow-50 to-yellow-100';
        if (status.includes('HIGH')) return 'from-orange-50 to-orange-100';
        return 'from-green-50 to-green-100';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Measurements</h2>

            {lastMeasurement && (
                <div className={`bg-gradient-to-br ${getStatusBgColor(lastMeasurement.status)} rounded-2xl border-2 border-gray-200 p-8 mb-8 shadow-lg`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <Heart className="w-10 h-10 text-red-500" />
                            <div>
                                <p className="text-gray-600 text-sm">Heart Rate</p>
                                <p className="text-4xl font-bold text-gray-900">{lastMeasurement.bpm} BPM</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Activity className="w-10 h-10 text-blue-500" />
                            <div>
                                <p className="text-gray-600 text-sm">Status</p>
                                <span className={`inline-block px-4 py-2 rounded-lg font-semibold border ${getStatusColor(lastMeasurement.status)}`}>
                  {lastMeasurement.status}
                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-gray-600 text-sm">Location</p>
                            <a
                                href={lastMeasurement.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-semibold underline"
                            >
                                {lastMeasurement.location}
                            </a>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm mt-6">
                        Measured at: {new Date(lastMeasurement.timestamp).toLocaleString()}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Measurement History</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">BPM</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {measurements.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No measurements yet. Waiting for data from Proteus sensor...
                                    </td>
                                </tr>
                            ) : (
                                measurements.map((m, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-bold text-gray-900">{m.bpm}</td>
                                        <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(m.status)}`}>
                          {m.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a href={m.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {m.location}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(m.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
