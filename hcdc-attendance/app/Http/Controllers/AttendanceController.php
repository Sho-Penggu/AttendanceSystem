<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Store a new attendance record
    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|string|unique:attendance,school_id',
            'name' => 'required|string',
        ]);

        $attendance = Attendance::create([
            'school_id' => $request->school_id,
            'name' => $request->name,
            'time_in' => Carbon::now(),
        ]);

        return response()->json($attendance, 201);
    }

    // List all attendance records
    public function index()
    {
        return response()->json(Attendance::all());
    }

    // Mark time out
    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->update(['time_out' => Carbon::now()]);

        return response()->json($attendance);
    }

    // Delete an attendance record (optional)
    public function destroy($id)
    {
        Attendance::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}
