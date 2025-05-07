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
    user_type: string; // This will be "Student", "Faculty", or "Visitor" from backend
}

export default function CheckInOut() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [identifier, setIdentifier] = useState('');
    const [isCheckedIn, setIsCheckedIn] = useState<boolean | null>(null);
    const [personName, setPersonName] = useState<string | null>(null);
    const [userType, setUserType] = useState<'student' | 'faculty' | 'visitor' | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    useEffect(() => {
        if (identifier.trim().length > 0) {
            // Auto-detect user type based on identifier
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

    // Function to detect user type based on identifier pattern
    const detectUserType = (id: string): 'student' | 'faculty' | 'visitor' | null => {
        // Student IDs typically are numeric and may have a specific format (e.g., 20210001)
        if (/^\d{8}$/.test(id)) {
            return 'student';
        }
        // Faculty IDs might have a specific prefix or format (e.g., F-12345)
        else if (/^F-\d+$/i.test(id)) {
            return 'faculty';
        }
        // If the input contains spaces, it's likely a visitor name
        else if (/\s/.test(id)) {
            return 'visitor';
        }
        // Any other format could be a faculty ID as well
        else if (id.length > 0) {
            return 'faculty';
        }

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
        // Convert userType to match what comes from API (capitalized)
        const apiUserType = type.charAt(0).toUpperCase() + type.slice(1);

        const found = attendance.find(
            (record) => record.identifier === id &&
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

        setLoading(true);
        try {
            // Note: The API expects lowercase user_type
            await axios.post('/api/check-in', {
                user_type: userType, // Must be lowercase here
                identifier: identifier
            });

            toast.success("Time-in successful!");
            setIdentifier('');  // Clear the input field after successful check-in
            fetchAttendance();
            // We don't clear the userType here to allow quick check-out
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
            // Note: The API expects lowercase user_type
            await axios.post('/api/check-out', {
                user_type: userType, // Must be lowercase here
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

    // Get placeholder text based on detected user type
    const getPlaceholder = () => {
        switch(userType) {
            case 'student': return 'Student ID (e.g., 20210001)';
            case 'faculty': return 'Faculty ID (e.g., F-12345)';
            case 'visitor': return 'Visitor Full Name';
            default: return 'Enter ID or Name';
        }
    };

    // Get user type label to display to the user
    const getUserTypeLabel = () => {
        return userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'Unknown';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Time-In / Time-Out', href: '/check-in-out' }]}>
            <Head title="Time-In / Time-Out" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Time-In / Time-Out</h1>

                {/* Input Form */}
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
                            disabled={loading || !userType}
                        >
                            {loading
                                ? 'Processing...'
                                : isCheckedIn
                                    ? `Check-Out ${personName || ''}`
                                    : 'Check-In'}
                        </button>
                    </form>
                </div>

                {/* List of Currently Checked-In People */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">Currently Timed-In</h2>
                    {attendance.filter(a => !a.time_out).length === 0 ? (
                        <p>No one is currently checked in</p>
                    ) : (
                        <ul className="list-disc pl-5">
                            {attendance.filter(a => !a.time_out).map((record) => (
                                <li key={record.id} className="py-1">
                                    {record.name} ( {record.user_type})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
