import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface AttendanceRecord {
    id: number;
    student_ID: string;
    name: string;
    time_in: string;
    time_out: string | null;
}

export default function CheckInOut() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [student_ID, setStudentId] = useState('');
    const [isCheckedIn, setIsCheckedIn] = useState<boolean | null>(null);
    const [studentName, setStudentName] = useState<string | null>(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    useEffect(() => {
        if (student_ID.trim().length > 0) {
            checkStudentStatus(student_ID);
        } else {
            setIsCheckedIn(null);
            setStudentName(null);
        }
    }, [student_ID, attendance]); // Also depend on attendance updates

    const fetchAttendance = async () => {
        try {
            const response = await axios.get('/api/attendance');
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const checkStudentStatus = (id: string) => {
        const found = attendance.find(
            (record) => record.student_ID === id && record.time_out === null
        );
        if (found) {
            setIsCheckedIn(true);
            setStudentName(found.name);
        } else {
            setIsCheckedIn(false);
            setStudentName(null);
        }
    };

    const handleCheckIn = async () => {
        try {
            await axios.post('/api/check-in', { student_ID });
            toast.success("Check-in successful!");
            setStudentId('');
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const message = error.response?.data?.message || 'Error during check-in';
            toast.error(message);
        }
    };

    const handleCheckOut = async () => {
        try {
            await axios.post('/api/check-out', { student_ID });
            toast.success("Check-out successful!");
            setStudentId('');
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const message = error.response?.data?.message || 'Error during check-out';
            toast.error(message);
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Check-In / Check-Out', href: '/check-in-out' }]}>
            <Head title="Check-In / Check-Out" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Check-In / Check-Out</h1>

                {/* Input Form */}
                <div className="border rounded-lg p-4 max-w-md w-full">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="text-lg font-semibold">Enter Student ID</label>
                        <input
                            type="text"
                            placeholder="e.g., 20210001"
                            value={student_ID}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        {studentName && (
                            <p className="text-sm text-gray-600">Name: {studentName}</p>
                        )}
                        <button
                            type="submit"
                            className={`${
                                isCheckedIn ? 'bg-red-500' : 'bg-blue-500'
                            } text-white px-4 py-2 rounded`}
                        >
                            {isCheckedIn ? 'Check-Out' : 'Check-In'}
                        </button>
                    </form>
                </div>

                {/* List of Currently Checked-In Students */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">Currently Checked-In Students</h2>
                    <ul className="list-disc pl-5">
                        {attendance.filter(a => !a.time_out).map((record) => (
                            <li key={record.id} className="py-1">
                                {record.name} ({record.student_ID})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
