<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // ✅ Check-In API
    public function checkIn(Request $request)
    {
        $request->validate([
            'school_id' => 'required|string',
            'name' => 'required|string',
        ]);

        // Store a new check-in
        $attendance = Attendance::create([
            'school_id' => $request->school_id,
            'name' => $request->name,
            'time_in' => Carbon::now(),
            'time_out' => null, // Ensure time_out is NULL initially
        ]);

        return response()->json([
            'message' => 'Check-in successful',
            'attendance' => $attendance
        ], 201);
    }

    // ✅ Check-Out API
    public function checkOut(Request $request)
    {
        $request->validate([
            'school_id' => 'required|string',
        ]);

        // Find the latest check-in for today with no time_out set
        $attendance = Attendance::where('school_id', $request->school_id)
            ->whereDate('time_in', Carbon::today())
            ->whereNull('time_out') // Ensure check-out is only applied to active check-ins
            ->latest()
            ->first();

        if (!$attendance) {
            return response()->json(['error' => 'No active check-in found for this user today'], 404);
        }

        // Set time_out
        $attendance->update(['time_out' => Carbon::now()]);

        return response()->json([
            'message' => 'Check-out successful',
            'attendance' => $attendance
        ]);
    }

    // ✅ Get All Attendance Records (For Listing)
    public function index()
    {
        return response()->json(Attendance::all());
    }

    // ✅ Admin: Update Attendance Record (Modify Time-in / Time-out)
    public function updateAttendance(Request $request, $id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json(['error' => 'Record not found'], 404);
        }

        $request->validate([
            'time_in' => 'nullable|date_format:Y-m-d H:i:s',
            'time_out' => 'nullable|date_format:Y-m-d H:i:s|after_or_equal:time_in',
        ]);

        $attendance->update([
            'time_in' => $request->time_in ?? $attendance->time_in,
            'time_out' => $request->time_out ?? $attendance->time_out,
        ]);

        return response()->json([
            'message' => 'Attendance record updated successfully',
            'attendance' => $attendance
        ]);
    }


    // ✅ Filter Attendance By Date (Daily, Monthly, Yearly)
    public function filterByDate(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:daily,monthly,yearly',
            'date' => 'required|date',
        ]);

        $query = Attendance::query();

        switch ($request->type) {
            case 'daily':
                $query->whereDate('time_in', Carbon::parse($request->date));
                break;
            case 'monthly':
                $query->whereMonth('time_in', Carbon::parse($request->date)->month)
                      ->whereYear('time_in', Carbon::parse($request->date)->year);
                break;
            case 'yearly':
                $query->whereYear('time_in', Carbon::parse($request->date)->year);
                break;
        }

        return response()->json($query->get());
    }

    // ✅ Delete an Attendance Record (For Admins)
    public function destroy($id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json(['error' => 'Record not found'], 404);
        }

        $attendance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

}
