import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface AttendanceRecord {
    id: number;
    name: string;
    time_in: string;
    time_out: string | null;
    identifier: string;
    user_type: string;
    laboratory: string;
}

// Pre-defined lab options or dynamically fetched from API
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

export default function AttendanceReport() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingCSV, setExportingCSV] = useState(false);
    const [selectedLab, setSelectedLab] = useState('');
    const [selectedUserType, setSelectedUserType] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, [selectedLab, selectedUserType, fromDate, toDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/attendance', {
                params: {
                    laboratory: selectedLab,
                    user_type: selectedUserType,
                    start_date: fromDate,
                    end_date: toDate,
                },
            });
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setExportingPDF(true);

            // Create the URL with query parameters
            let url = '/api/export-pdf?';
            const params = new URLSearchParams();

            if (selectedLab) params.append('laboratory', selectedLab);
            if (selectedUserType) params.append('user_type', selectedUserType);
            if (fromDate) params.append('start_date', fromDate);
            if (toDate) params.append('end_date', toDate);

            url += params.toString();

            // Use window.open to directly download the PDF
            window.open(url, '_blank');

            toast.success('PDF export initiated');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF');
        } finally {
            setExportingPDF(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            setExportingCSV(true);
            const params = {
                laboratory: selectedLab,
                user_type: selectedUserType,
                start_date: fromDate,
                end_date: toDate,
            };

            const response = await axios.get('/api/export-csv', {
                params,
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attendance_report.csv');
            document.body.appendChild(link);
            link.click();
            toast.success('CSV exported successfully');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toast.error('Failed to export CSV');
        } finally {
            setExportingCSV(false);
        }
    };

    const filteredAttendance = attendance.filter((record) => {
        const matchesLab = selectedLab ? record.laboratory === selectedLab : true;
        const matchesUserType = selectedUserType ? record.user_type === selectedUserType : true;

        const recordDate = record.time_in.slice(0, 10); // format: YYYY-MM-DD
        const matchesFrom = fromDate ? recordDate >= fromDate : true;
        const matchesTo = toDate ? recordDate <= toDate : true;

        return matchesLab && matchesUserType && matchesFrom && matchesTo;
    });

    // Aggregate attendance counts by date
    const attendanceStats = filteredAttendance.reduce((acc: { [date: string]: number }, record) => {
        const date = record.time_in.slice(0, 10); // format: YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Format for Recharts
    const chartData = Object.entries(attendanceStats)
        .map(([date, count]) => ({
            date,
            count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return (
        <AppLayout breadcrumbs={[{ title: 'Attendance Report', href: '/attendance-report' }]}>
            <Head title="Attendance Report" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Attendance Report & Statistics</h1>

                {/* Enhanced Filter Section */}
                <div className="border rounded-lg p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-3">Filters</h2>
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Lab Filter */}
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600">Laboratory</label>
                            <select
                                value={selectedLab}
                                onChange={(e) => setSelectedLab(e.target.value)}
                                className="border rounded p-2"
                            >
                                <option value="">All Labs</option>
                                {labOptions.map((lab) => (
                                    <option key={lab} value={lab}>
                                        {lab}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* User Type Filter */}
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600">User Type</label>
                            <select
                                value={selectedUserType}
                                onChange={(e) => setSelectedUserType(e.target.value)}
                                className="border rounded p-2"
                            >
                                <option value="">All User Types</option>
                                <option value="Student">Student</option>
                                <option value="Faculty">Faculty</option>
                                <option value="Visitor">Visitor</option>
                            </select>
                        </div>

                        {/* Date Range Filters */}
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600">From</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border rounded p-2"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600">To</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border rounded p-2"
                            />
                        </div>

                        {/* Quick Range Buttons */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Quick Range</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const today = new Date().toISOString().slice(0, 10);
                                        setFromDate(today);
                                        setToDate(today);
                                    }}
                                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => {
                                        const now = new Date();
                                        const start = new Date(now);
                                        start.setDate(now.getDate() - 6);
                                        setFromDate(start.toISOString().slice(0, 10));
                                        setToDate(now.toISOString().slice(0, 10));
                                    }}
                                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                >
                                    This Week
                                </button>
                                <button
                                    onClick={() => {
                                        const now = new Date();
                                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                                        setFromDate(start.toISOString().slice(0, 10));
                                        setToDate(now.toISOString().slice(0, 10));
                                    }}
                                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                >
                                    This Month
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Records Counter */}
                <div className="mb-2 text-gray-700">
                    Total Records: <strong>{filteredAttendance.length}</strong>
                </div>

                {/* Statistics Section */}
                <Card className="w-full mb-4">
                    <CardContent className="p-4">
                        <h2 className="text-xl font-semibold mb-4">Attendance Statistics</h2>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid stroke="#ccc" />
                                    <XAxis dataKey="date" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500">No data available for statistics.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance Table */}
                <div className="border rounded-lg p-4 w-full overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">Attendance List</h2>
                    <table className="table-auto w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">User Type</th>
                                <th className="px-4 py-2 border">Laboratory</th>
                                <th className="px-4 py-2 border">Time In</th>
                                <th className="px-4 py-2 border">Time Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-4 py-2 border">{record.name}</td>
                                        <td className="px-4 py-2 border">{record.user_type}</td>
                                        <td className="px-4 py-2 border">{record.laboratory}</td>
                                        <td className="px-4 py-2 border">{record.time_in}</td>
                                        <td className="px-4 py-2 border">
                                            {record.time_out || 'Still Checked-In'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-2 border text-center" colSpan={5}>
                                        {loading ? 'Loading attendance records...' : 'No attendance records found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Export Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                        onClick={handleExportPDF}
                        disabled={loading || exportingPDF || exportingCSV}
                    >
                        {exportingPDF ? 'Exporting PDF...' : 'Export as PDF'}
                    </button>
                    <button
                        className="bg-green-600 text-white py-2 px-4 rounded-lg"
                        onClick={handleExportCSV}
                        disabled={loading || exportingPDF || exportingCSV}
                    >
                        {exportingCSV ? 'Exporting CSV...' : 'Export as CSV'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
