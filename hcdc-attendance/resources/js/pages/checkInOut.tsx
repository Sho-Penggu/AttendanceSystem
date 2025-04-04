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
    const [student_ID, setSchoolId] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await axios.get('/api/attendance');
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/check-in', { student_ID: student_ID });
            toast.success("Check-in successful!");
            setSchoolId('');
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const message = error.response?.data?.message || 'Error during check-in';
            toast.error(message);
        }
    };

    const handleCheckOut = async (student_ID: string) => {
        try {
            await axios.post('/api/check-out', { student_ID });
            toast.success("Check-out successful!");
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const message = error.response?.data?.message || 'Error during check-out';
            toast.error(message);
        }
    };


    return (
        <AppLayout breadcrumbs={[{ title: 'Check-In / Check-Out', href: '/check-in-out' }]}>
            <Head title="Check-In / Check-Out" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Check-In / Check-Out</h1>

                {/* Check-In Form */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">Check-In</h2>
                    <form onSubmit={handleCheckIn} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="School ID"
                            value={student_ID}
                            onChange={(e) => setSchoolId(e.target.value)}
                            className="border p-2 rounded w-1/4"
                            required
                        />
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Check-In</button>
                    </form>
                </div>

                {/* Check-Out Section */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">Check-Out</h2>
                    <ul className="list-disc pl-5">
                        {attendance.filter(a => !a.time_out).map((record) => (
                            <li key={record.id} className="flex justify-between items-center py-2">
                                <span>{record.name} ({record.student_ID})</span>
                                <button onClick={() => handleCheckOut(record.student_ID)} className="bg-red-500 text-white px-4 py-2 rounded">Check-Out</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
