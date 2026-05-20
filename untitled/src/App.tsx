import { useState, useEffect } from 'react';
import { Heart, AlertCircle, MapPin, LogOut } from 'lucide-react';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
    const [currentUser, setCurrentUser] = useState<'patient' | 'doctor' | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('currentUser');
        if (saved) setCurrentUser(saved as 'patient' | 'doctor');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="flex justify-center mb-6">
                            <Heart className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
                            Heart Monitor
                        </h1>

                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    localStorage.setItem('currentUser', 'patient');
                                    setCurrentUser('patient');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
                            >
                                Login as Patient
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('currentUser', 'doctor');
                                    setCurrentUser('doctor');
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
                            >
                                Login as Doctor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-500" />
                        <span className="font-bold text-lg text-gray-900">Heart Monitor</span>
                    </div>
                    <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">
              {currentUser === 'patient' ? 'Patient' : 'Doctor'}
            </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {currentUser === 'patient' ? (
                <PatientDashboard />
            ) : (
                <DoctorDashboard />
            )}
        </div>
    );
}

export default App;
