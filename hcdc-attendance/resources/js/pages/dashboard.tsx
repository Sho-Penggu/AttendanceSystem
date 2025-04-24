import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Define Attendance Record Type
interface AttendanceRecord {
    id: number;
    name: string;
    time_in: string;
    time_out: string | null;
    identifier: string; // This will hold student_ID, faculty_ID, or visitor name
    user_type: string;  // This will be "Student", "Faculty", or "Visitor" from backend
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [identifier, setIdentifier] = useState<string>('');
    const [userType, setUserType] = useState<'student' | 'faculty' | 'visitor'>('student');
    const [filter, setFilter] = useState<string>('day');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/attendance');
            const sortedData = response.data.sort((a: AttendanceRecord, b: AttendanceRecord) =>
                new Date(b.time_in).getTime() - new Date(a.time_in).getTime()
            );
            setAttendance(sortedData);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to fetch attendance records');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) {
            toast.error("ID/Name is required");
            return;
        }

        setIsLoading(true);
        try {
            // API expects lowercase user_type
            await axios.post('/api/check-in', {
                user_type: userType,
                identifier: identifier
            });
            toast.success("Check-in successful!");
            setIdentifier('');
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ error?: string, message?: string }>;
            console.error('Check-in error:', error.response?.data);
            const message = error.response?.data?.error || error.response?.data?.message || 'Error during check-in';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckOut = async (record: AttendanceRecord) => {
        setIsLoading(true);
        try {
            const apiUserType = record.user_type.toLowerCase();

            // For visitors, use the name as the identifier
            const identifierToSend = apiUserType === 'visitor' ? record.name : record.identifier;

            await axios.post('/api/check-out', {
                user_type: apiUserType,
                identifier: identifierToSend
            });

            toast.success("Check-out successful!");
            fetchAttendance();
        } catch (err) {
            const error = err as AxiosError<{ error?: string, message?: string }>;
            console.error('Check-out error:', error.response?.data);
            const message = error.response?.data?.error || error.response?.data?.message || 'Error during check-out';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAttendance = () => {
        const selected = new Date(selectedDate);
        return attendance
            .filter(record => {
                const timeInDate = new Date(record.time_in);
                switch (filter) {
                    case 'day':
                        return timeInDate.toDateString() === selected.toDateString();
                    case 'week': {
                        const weekStart = new Date(selected);
                        weekStart.setDate(selected.getDate() - selected.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return timeInDate >= weekStart && timeInDate <= weekEnd;
                    }
                    case 'month':
                        return (
                            timeInDate.getMonth() === selected.getMonth() &&
                            timeInDate.getFullYear() === selected.getFullYear()
                        );
                    case 'year':
                        return timeInDate.getFullYear() === selected.getFullYear();
                    default:
                        return true;
                }
            })
            .sort((a, b) => new Date(b.time_in).getTime() - new Date(a.time_in).getTime());
    };

    // Count by user type (converting to lowercase for comparison)
    const countByUserType = (type: string) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        return attendance.filter(record => record.user_type === capitalizedType).length;
    };

    // Count currently checked in
    const countCurrentlyCheckedIn = () => {
        return attendance.filter(record => !record.time_out).length;
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
                        <div className="flex justify-around mt-2">
                            <span>Students: {countByUserType('student')}</span>
                            <span>Faculty: {countByUserType('faculty')}</span>
                            <span>Visitors: {countByUserType('visitor')}</span>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border p-4 text-center">
                        <h2 className="text-xl font-bold">Currently Checked In</h2>
                        <p className="text-3xl font-semibold">{countCurrentlyCheckedIn()}</p>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border p-4 text-center">
                        <h2 className="text-xl font-bold">Today's Check-outs</h2>
                        <p className="text-3xl font-semibold">
                            {attendance.filter(a => a.time_out && new Date(a.time_out).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                </div>

                {/* Attendance Filter */}
                <div className="mb-4 flex flex-wrap gap-4">
                    <div>
                        <label className="mr-2 font-bold">Filter by:</label>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded">
                            <option value="day">Day</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="mr-2 font-bold">Select Date:</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border p-2 rounded" />
                    </div>
                </div>

                {/* Attendance Form & List */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
                    <form onSubmit={handleCheckIn} className="mb-4 flex flex-wrap gap-4">
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value as 'student' | 'faculty' | 'visitor')}
                            className="border p-2 rounded"
                            disabled={isLoading}
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="visitor">Visitor</option>
                        </select>
                        <input
                            type="text"
                            placeholder={userType === 'visitor' ? "Visitor Name" : "ID Number"}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="border p-2 rounded w-1/4"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Check-In"}
                        </button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Type</th>
                                    <th className="border p-2">ID/Name</th>
                                    <th className="border p-2">Name</th>
                                    <th className="border p-2">Time In</th>
                                    <th className="border p-2">Time Out</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center p-4">Loading...</td>
                                    </tr>
                                ) : filterAttendance().length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center p-4">No attendance records found</td>
                                    </tr>
                                ) : (
                                    filterAttendance().map((record) => (
                                        <tr key={record.id} className="text-center">
                                            <td className="border p-2">{record.user_type}</td>
                                            <td className="border p-2">{record.identifier}</td>
                                            <td className="border p-2">{record.name}</td>
                                            <td className="border p-2">{new Date(record.time_in).toLocaleString()}</td>
                                            <td className="border p-2">
                                                {record.time_out ? new Date(record.time_out).toLocaleString() : '---'}
                                            </td>
                                            <td className="border p-2">
                                                {!record.time_out && (
                                                    <button
                                                        onClick={() => handleCheckOut(record)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? "Processing..." : "Check-Out"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
