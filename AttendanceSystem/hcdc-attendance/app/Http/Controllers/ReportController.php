<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Illuminate\Support\Facades\Log; // Add the Log facade

class ReportController extends Controller
{
    public function getStatistics(Request $request)
    {
        Log::info('Getting statistics', [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'laboratory' => $request->laboratory,
            'user_type' => $request->user_type,
        ]);

        $query = Attendance::query();

        // Filter: date range
        if ($request->has(['start_date', 'end_date'])) {
            Log::info('Filtering by date range', [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]);
            $query->whereBetween('time_in', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        // Filter: laboratory
        if ($request->filled('laboratory')) {
            Log::info('Filtering by laboratory', ['laboratory' => $request->laboratory]);
            $query->where('laboratory', $request->laboratory);
        }

        // Filter: user type
        if ($request->filled('user_type')) {
            Log::info('Filtering by user type', ['user_type' => $request->user_type]);
            $query->where('user_type', $request->user_type);
        }

        // Group by date
        $data = $query->selectRaw('DATE(time_in) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        Log::info('Statistics data fetched', ['data_count' => $data->count()]);

        return response()->json($data);
    }

    public function exportCSV(Request $request)
    {
        Log::info('Exporting CSV', [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'laboratory' => $request->laboratory,
            'user_type' => $request->user_type,
        ]);

        $query = Attendance::with('attendable');

        if ($request->has(['start_date', 'end_date'])) {
            Log::info('Filtering by date range', [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]);
            $query->whereBetween('time_in', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        if ($request->filled('laboratory')) {
            Log::info('Filtering by laboratory', ['laboratory' => $request->laboratory]);
            $query->where('laboratory', $request->laboratory);
        }

        if ($request->filled('user_type')) {
            Log::info('Filtering by user type', ['user_type' => $request->user_type]);
            $query->where('user_type', $request->user_type);
        }

        $attendances = $query->orderBy('time_in', 'asc')->get();

        Log::info('Attendances fetched for CSV', ['attendance_count' => $attendances->count()]);

        $filename = 'attendance_' . now()->format('Ymd_His') . '.csv';
        $path = storage_path("app/exports/{$filename}");

        // Create export directory if it doesn't exist
        if (!file_exists(dirname($path))) {
            Log::info('Creating export directory', ['path' => dirname($path)]);
            mkdir(dirname($path), 0755, true);
        }

        SimpleExcelWriter::create($path)
            ->addHeader(['ID', 'Name', 'User Type', 'Laboratory', 'Time In', 'Time Out', 'Date'])
            ->addRows(
                $attendances->map(function ($record) {
                    return [
                        'ID'         => $record->id,
                        'Name'       => $record->attendable->name ?? 'Unknown',
                        'User Type'  => class_basename($record->attendable_type),
                        'Laboratory' => $record->laboratory,
                        'Time In'    => $record->time_in,
                        'Time Out'   => $record->time_out,
                        'Date'       => $record->created_at->format('Y-m-d'),
                    ];
                })->toArray()
            );

        Log::info('CSV export generated', ['filename' => $filename]);

        return response()->download($path, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ])->deleteFileAfterSend();

    }

    public function exportPDF(Request $request)
    {
        Log::info('Exporting PDF', [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'laboratory' => $request->laboratory,
            'user_type' => $request->user_type,
        ]);

        // Normalize inputs
        $userType = $request->user_type ?? '';
        $lab = $request->laboratory ?? '';
        $fromDate = $request->start_date ?? '';
        $toDate = $request->end_date ?? '';

        $query = Attendance::query();

        // Apply date filters
        if (!empty($fromDate) && !empty($toDate)) {
            $start = Carbon::parse($fromDate)->startOfDay();
            $end = Carbon::parse($toDate)->endOfDay();
            $query->whereBetween('time_in', [$start, $end]);
        } elseif (!empty($fromDate)) {
            $start = Carbon::parse($fromDate)->startOfDay();
            $query->where('time_in', '>=', $start);
        } elseif (!empty($toDate)) {
            $end = Carbon::parse($toDate)->endOfDay();
            $query->where('time_in', '<=', $end);
        }

        // Apply laboratory filter
        if (!empty($lab)) {
            $query->where('laboratory', $lab);
        }

        // Apply user type filter
        if (!empty($userType)) {
            $query->where('user_type', $userType);
        }

        $attendanceRecords = $query->orderBy('time_in')->get();

        Log::info('PDF export data fetched', ['data_count' => $attendanceRecords->count()]);

        // Make sure the DomPDF package is properly configured in config/app.php
        $pdf = PDF::loadView('exports.attendance_pdf', [
            'attendanceRecords' => $attendanceRecords,
            'lab' => $lab,
            'userType' => $userType,
            'fromDate' => $fromDate,
            'toDate' => $toDate
        ]);

        Log::info('PDF generated and ready to download');

        return $pdf->download('attendance_report.pdf');
    }



}
