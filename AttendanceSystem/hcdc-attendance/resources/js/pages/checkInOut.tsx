import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface AttendanceRecord {
    id: number;
    name: string;
    time_in: string;
    time_out: string | null;
    identifier: string;
    user_type: string; // "Student", "Faculty", or "Visitor"
    laboratory: string;
}

// Static lab options
const labOptions = [
    'IT Lab 1',
    'IT Lab 2',
    'IT Lab 3 (MacLab)',
    'CyberLab',
    'INT Lab',
    'CCL 1',
    'CCL 2',
    'CCL 3',
];

export default function CheckInOut() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [identifier, setIdentifier] = useState('');
    const [isCheckedIn, setIsCheckedIn] = useState<boolean | null>(null);
    const [personName, setPersonName] = useState<string | null>(null);
    const [userType, setUserType] = useState<'student' | 'faculty' | 'visitor' | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedLaboratory, setSelectedLaboratory] = useState<string>(labOptions[0]);

    useEffect(() => {
        fetchAttendance();
    }, []);

    useEffect(() => {
        if (identifier.trim().length > 0) {
            const detectedType = detectUserType(identifier);
            setUserType(detectedType);

            if (detectedType) {
                checkPersonStatus(identifier, detectedType);
            } else {
                setIsCheckedIn(null);
                setPersonName(null);
            }
        } else {
            setIsCheckedIn(null);
            setPersonName(null);
            setUserType(null);
        }
    }, [identifier, attendance]);

    const detectUserType = (id: string): 'student' | 'faculty' | 'visitor' | null => {
        if (/^\d{8}$/.test(id)) return 'student';
        else if (/^F-\d+$/i.test(id)) return 'faculty';
        else if (/\s/.test(id)) return 'visitor';
        else if (id.length > 0) return 'faculty';
        return null;
    };

    const fetchAttendance = async () => {
        try {
            const response = await axios.get('/api/attendance');
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to fetch attendance records');
        }
    };

    const checkPersonStatus = (id: string, type: 'student' | 'faculty' | 'visitor') => {
        const apiUserType = type.charAt(0).toUpperCase() + type.slice(1);

        const found = attendance.find(
            (record) =>
                record.identifier === id &&
                record.user_type === apiUserType &&
                record.time_out === null
        );

        if (found) {
            setIsCheckedIn(true);
            setPersonName(found.name);
        } else {
            setIsCheckedIn(false);
            setPersonName(null);
        }
    };

    const handleCheckIn = async () => {
        if (!userType || !identifier) {
            toast.error("Please enter a valid ID or name");
            return;
        }

        if (!selectedLaboratory) {
            toast.error("Please select a laboratory");
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/check-in', {
                user_type: userType,
                identifier: identifier,
                laboratory: selectedLaboratory
            });

            toast.success("Time-in successful!");
            setIdentifier('');
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ error?: string, message?: string }>;
            console.error('Time-in error:', error.response?.data);
            const message = error.response?.data?.error || error.response?.data?.message || 'Error during Time-in';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!userType || !identifier) {
            toast.error("Please enter a valid ID or name");
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/check-out', {
                user_type: userType,
                identifier: identifier
            });

            toast.success("Time-out successful!");
            setIdentifier('');
            setUserType(null);
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ error?: string, message?: string }>;
            console.error('Time-out error:', error.response?.data);
            const message = error.response?.data?.error || error.response?.data?.message || 'Error during time-out';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCheckedIn) {
            handleCheckOut();
        } else {
            handleCheckIn();
        }
    };

    const getPlaceholder = () => {
        switch (userType) {
            case 'student': return 'Student ID (e.g., 20210001)';
            case 'faculty': return 'Faculty ID (e.g., F-12345)';
            case 'visitor': return 'Visitor Full Name';
            default: return 'Enter ID or Name';
        }
    };

    const getUserTypeLabel = () => {
        return userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'Unknown';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Time-In / Time-Out', href: '/check-in-out' }]}>
            <Head title="Time-In / Time-Out" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Time-In / Time-Out</h1>

                <div className="border rounded-lg p-4 max-w-md w-full">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="text-lg font-semibold">Enter ID (Name if Visitor)</label>
                        <input
                            type="text"
                            placeholder={getPlaceholder()}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="border p-2 rounded"
                            required
                            disabled={loading}
                        />

                        {!isCheckedIn && (
                            <div>
                                <label className="text-lg font-semibold">Select Laboratory</label>
                                <select
                                    value={selectedLaboratory}
                                    onChange={(e) => setSelectedLaboratory(e.target.value)}
                                    className="border p-2 rounded w-full"
                                    required
                                    disabled={loading}
                                >
                                    <option value="" disabled>Select a laboratory</option>
                                    {labOptions.map((lab) => (
                                        <option key={lab} value={lab}>
                                            {lab}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {userType && (
                            <div className="bg-blue-100 p-2 rounded">
                                <p className="text-blue-700">
                                    Detected as: <strong>{getUserTypeLabel()}</strong>
                                </p>
                            </div>
                        )}

                        {personName && isCheckedIn && (
                            <div className="bg-green-100 p-2 rounded">
                                <p className="text-green-700">
                                    {personName} is currently checked in
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`${
                                isCheckedIn ? 'bg-red-500' : 'bg-blue-500'
                            } text-white px-4 py-2 rounded`}
                            disabled={loading || !userType || (!isCheckedIn && !selectedLaboratory)}
                        >
                            {loading
                                ? 'Processing...'
                                : isCheckedIn
                                    ? `Time-Out ${personName || ''}`
                                    : 'Time-In'}
                        </button>
                    </form>
                </div>

                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">Currently Timed-In</h2>
                    {attendance.filter(a => !a.time_out).length === 0 ? (
                        <p>No one is currently checked in</p>
                    ) : (
                        <ul className="list-disc pl-5">
                            {attendance.filter(a => !a.time_out).map((record) => (
                                <li key={record.id} className="py-1">
                                    {record.name} ({record.user_type}) - {record.laboratory}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
