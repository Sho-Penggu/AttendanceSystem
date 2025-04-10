<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // ✅ Check-In API
    // ✅ Prevent Duplicate Check-ins
    public function checkIn(Request $request)
    {
        $request->validate([
            'student_ID' => 'required|exists:students,student_ID', // Ensure student exists
        ]);

        // Retrieve student details from the database
        $student = \App\Models\Student::where('student_ID', $request->student_ID)->first();

        // Check if student is already checked in today
        $existingCheckIn = Attendance::where('student_ID', $request->student_ID)
            ->whereDate('time_in', Carbon::today())
            ->whereNull('time_out')
            ->exists();

        if ($existingCheckIn) {
            return response()->json([
                'error' => 'Student is already checked in and has not checked out yet.'
            ], 400);
        }

        // Store new check-in
        $attendance = Attendance::create([
            'student_ID' => $student->student_ID, // Auto-filled
            'name' => $student->name, // Auto-filled
            'time_in' => now(),
            'time_out' => null,
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
            'student_ID' => 'required|exists:attendance,student_ID',
        ]);

        // Find the latest check-in for today without a check-out time
        $attendance = Attendance::where('student_ID', $request->student_ID)
            ->whereDate('time_in', Carbon::today())
            ->whereNull('time_out')
            ->latest()
            ->first();

        if (!$attendance) {
            return response()->json(['error' => 'No active check-in found for this student today'], 404);
        }

        // Update time_out
        $attendance->update(['time_out' => now()]);

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
