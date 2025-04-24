<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Visitor;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // ✅ Check-In (Polymorphic)
    public function checkIn(Request $request)
    {
        $request->validate([
            'user_type' => 'required|in:student,faculty,visitor',
            'identifier' => 'required'
        ]);

        $user = $this->findUser($request->user_type, $request->identifier);
        if (!$user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        // Check if already checked in
        $existing = Attendance::where('attendable_type', get_class($user))
            ->where('attendable_id', $user->id)
            ->whereDate('time_in', Carbon::today())
            ->whereNull('time_out')
            ->exists();

        if ($existing) {
            return response()->json(['error' => 'Already checked in today.'], 400);
        }

        // Create a new Attendance record
        $attendance = new Attendance([
            'time_in' => now(),
            'name' => $user->name,           // Get name from the user
            'identifier' => $request->identifier, // Use identifier provided in the request
            'user_type' => $request->user_type,   // Store user type as well
            'attendable_type' => get_class($user),
            'attendable_id' => $user->id,
        ]);

        $user->attendances()->save($attendance);

        return response()->json(['message' => 'Check-in successful', 'attendance' => $attendance]);
    }
    // ✅ Check-Out (Polymorphic)
    public function checkOut(Request $request)
    {
        $request->validate([
            'user_type' => 'required|in:student,faculty,visitor',
            'identifier' => 'required'
        ]);

        $user = $this->findUser($request->user_type, $request->identifier);
        if (!$user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        $attendance = Attendance::where('attendable_type', get_class($user))
            ->where('attendable_id', $user->id)
            ->whereDate('time_in', Carbon::today())
            ->whereNull('time_out')
            ->latest()
            ->first();

        if (!$attendance) {
            return response()->json(['error' => 'No active check-in found today.'], 404);
        }

        $attendance->update(['time_out' => now()]);
        return response()->json(['message' => 'Check-out successful', 'attendance' => $attendance]);
    }

    // ✅ Admin: View All Attendance
    public function index()
    {
        $attendances = Attendance::with('attendable')->get()->map(function ($attendance) {
            $attendable = $attendance->attendable; // Grab the attendable first

            return [
                'id' => $attendance->id,
                'time_in' => $attendance->time_in,
                'time_out' => $attendance->time_out,
                // Check if attendable exists
                'name' => $attendable ? $attendable->name : 'Unknown',
                'identifier' => $attendable ?
                            ($attendable instanceof Student ? $attendable->student_ID : ($attendable instanceof Faculty ? $attendable->faculty_ID : null))
                            : null,
                'user_type' => $attendable ? class_basename($attendable) : 'Unknown',
            ];
        });

        return response()->json($attendances);
    }

    // ✅ Admin: Update
    public function updateAttendance(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);

        $request->validate([
            'time_in' => 'nullable|date_format:Y-m-d H:i:s',
            'time_out' => 'nullable|date_format:Y-m-d H:i:s|after_or_equal:time_in',
        ]);

        $attendance->update([
            'time_in' => $request->time_in ?? $attendance->time_in,
            'time_out' => $request->time_out ?? $attendance->time_out,
        ]);

        return response()->json(['message' => 'Attendance updated', 'attendance' => $attendance]);
    }

    // ✅ Admin: Filter by date
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

        return response()->json($query->with('attendable')->get());
    }

    // ✅ Admin: Delete
    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    // ✅ Helper to find the correct model
    private function findUser($type, $identifier)
    {
        switch ($type) {
            case 'student':
                return Student::where('student_ID', $identifier)->first();
            case 'faculty':
                return Faculty::where('faculty_ID', $identifier)->first();
            case 'visitor':
                return Visitor::where('name', $identifier)->first(); // Assuming name is unique enough
            default:
                return null;
        }
    }
}
