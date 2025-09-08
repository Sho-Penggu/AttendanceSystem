<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


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

    public function storeFromCSV(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048', // Max size 2MB
        ]);

        // Store the uploaded CSV file in the 'private' disk (you can change this if needed)
        $filePath = $request->file('csv_file')->store('csvs', 'private');

        // Build the correct full path based on where it's stored
        $fullPath = storage_path('app/private/' . $filePath);

        if (!file_exists($fullPath)) {
            return response()->json(['error' => "File not found at: $fullPath"], 500);
        }

        // Open and read the CSV file
        $file = fopen($fullPath, 'r');
        $header = fgetcsv($file); // Skip the header row

        $students = [];
        // Parse the CSV and prepare the data for insertion
        while ($row = fgetcsv($file)) {
            $students[] = [
                'student_ID' => $row[0],
                'name' => $row[1],
                'gender' => $row[2],
                'department' => $row[3],
                'year' => $row[4],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert the students into the database in a transaction
        try {
            DB::beginTransaction();
            Student::insert($students); // Bulk insert the data
            DB::commit();

            // Remove the file after processing
            Storage::disk('private')->delete($filePath);

            return response()->json(['message' => 'Students successfully registered'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to register students: ' . $e->getMessage()], 500);
        } finally {
            fclose($file); // Close the file handle
        }
    }

}
