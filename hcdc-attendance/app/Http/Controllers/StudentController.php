<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Attendance;

class StudentController extends Controller
{
    // Fetch all students
    public function index()
    {
        return response()->json(Student::all());
    }

    // Store a new student
    public function store(Request $request)
    {
        $request->validate([
            'student_ID' => 'required|unique:students',
            'name' => 'required|string',
            'gender' => 'required|string|in:male,female,Male,Female', // Allowing case variation
            'department' => 'required|string',
            'year' => 'required|integer|min:1|max:4', // Assuming 1 to 4 corresponds to school year
        ]);

        $student = Student::create($request->all());

        return response()->json(['message' => 'Student created', 'data' => $student], 201);
    }

    // Update an existing student
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string',
            'gender' => 'sometimes|string|in:male,female,Male,Female',
            'department' => 'sometimes|string',
            'year' => 'sometimes|integer|min:1|max:4',
        ]);

        $student->update($request->all());

        return response()->json(['message' => 'Student updated', 'data' => $student], 200);
    }

    // Delete a student
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();

        return response()->json(['message' => 'Student deleted'], 200);
    }

    // Show a specific student by ID
    public function show($id)
    {
        $student = Student::findOrFail($id);
        return response()->json($student);
    }

    // Fetch attendances for a specific student
    public function attendances($id)
    {
        $student = Student::findOrFail($id);
        return response()->json($student->attendances);
    }
}
