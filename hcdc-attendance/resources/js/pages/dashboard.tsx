import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Define Attendance Record Type
interface AttendanceRecord {
    id: number;
    school_id: string;
    name: string;
    time_in: string;
    time_out: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [schoolId, setSchoolId] = useState<string>('');
    const [name, setName] = useState<string>('');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/attendance', { school_id: schoolId, name });
            setSchoolId('');
            setName('');
            fetchAttendance();
        } catch (error) {
            console.error('Error adding attendance:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Summary Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border p-4 text-center">
                        <h2 className="text-xl font-bold">Total Attendance</h2>
                        <p className="text-3xl font-semibold">{attendance.length}</p>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border p-4 text-center">
                        <h2 className="text-xl font-bold">Today's Check-ins</h2>
                        <p className="text-3xl font-semibold">{attendance.filter(a => new Date(a.time_in).toDateString() === new Date().toDateString()).length}</p>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                {/* Attendance Form & List */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
                    <form onSubmit={handleSubmit} className="mb-4 flex gap-4">
                        <input
                            type="text"
                            placeholder="School ID"
                            value={schoolId}
                            onChange={(e) => setSchoolId(e.target.value)}
                            className="border p-2 rounded w-1/4"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border p-2 rounded w-1/4"
                            required
                        />
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
                    </form>
                    <table className="w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">School ID</th>
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Time In</th>
                                <th className="border p-2">Time Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record) => (
                                <tr key={record.id} className="text-center">
                                    <td className="border p-2">{record.school_id}</td>
                                    <td className="border p-2">{record.name}</td>
                                    <td className="border p-2">{new Date(record.time_in).toLocaleString()}</td>
                                    <td className="border p-2">{record.time_out ? new Date(record.time_out).toLocaleString() : '---'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
