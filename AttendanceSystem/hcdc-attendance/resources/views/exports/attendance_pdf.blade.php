<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ccc;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        h1, h2 {
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        .filters {
            margin-bottom: 15px;
            font-size: 12px;
            border: 1px solid #ddd;
            padding: 10px;
            background-color: #f8f8f8;
        }
        .filters p {
            margin: 5px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            color: #666;
        }
        .timestamp {
            text-align: right;
            font-size: 10px;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Attendance Report</h1>
        <p>Generated on: {{ date('Y-m-d H:i:s') }}</p>
    </div>

    <div class="filters">
        <h2>Filter Criteria</h2>
        @if($lab)
            <p><strong>Laboratory:</strong> {{ $lab }}</p>
        @else
            <p><strong>Laboratory:</strong> All</p>
        @endif

        @if($userType)
            <p><strong>User Type:</strong> {{ $userType }}</p>
        @else
            <p><strong>User Type:</strong> All</p>
        @endif

        @if($fromDate && $toDate)
            <p><strong>Date Range:</strong> {{ $fromDate }} to {{ $toDate }}</p>
        @elseif($fromDate)
            <p><strong>From:</strong> {{ $fromDate }}</p>
        @elseif($toDate)
            <p><strong>Until:</strong> {{ $toDate }}</p>
        @else
            <p><strong>Date Range:</strong> All dates</p>
        @endif

        <p><strong>Total Records:</strong> {{ count($attendanceRecords) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>User Type</th>
                <th>Laboratory</th>
                <th>Time In</th>
                <th>Time Out</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendanceRecords as $attendance)
                <tr>
                    <td>{{ $attendance->name }}</td>
                    <td>{{ $attendance->user_type }}</td>
                    <td>{{ $attendance->laboratory }}</td>
                    <td>{{ \Carbon\Carbon::parse($attendance->time_in)->format('Y-m-d H:i:s') }}</td>
                    <td>{{ $attendance->time_out ? \Carbon\Carbon::parse($attendance->time_out)->format('Y-m-d H:i:s') : 'Still Checked-In' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center;">No attendance records found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>This is an automatically generated report.</p>
    </div>

    <div class="timestamp">
        Page generated on {{ date('Y-m-d H:i:s') }}
    </div>
</body>
</html>
