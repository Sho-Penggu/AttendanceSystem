<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FacultyController extends Controller
{
    // List all faculty members
    public function index()
    {
        return response()->json(Faculty::all());
    }

    // Store a new faculty member
    public function store(Request $request)
    {
        $request->validate([
            'faculty_ID' => 'required|unique:faculty',
            'name' => 'required|string',
            'department' => 'required|string',
            'position' => 'required|string',
        ]);

        $faculty = Faculty::create($request->all());

        return response()->json(['message' => 'Faculty created', 'data' => $faculty], 201);
    }

    // Update a faculty member
    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string',
            'department' => 'sometimes|string',
            'position' => 'sometimes|string',
        ]);

        $faculty->update($request->all());

        return response()->json(['message' => 'Faculty updated', 'data' => $faculty]);
    }

    // Delete a faculty member
    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->delete();

        return response()->json(['message' => 'Faculty deleted']);
    }

    //Show by ID
    public function show($id)
    {
        $faculty = Faculty::findOrFail($id);
        return response()->json($faculty);
    }


    //upload csv
    public function storeFromCSV(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        // ✅ Store file in the 'private' disk under 'csvs' directory
        $filePath = $request->file('csv_file')->store('csvs', 'private');

        // ✅ Build correct full path
        $fullPath = storage_path('app/private/' . $filePath);

        // ❗ File check
        if (!file_exists($fullPath)) {
            return response()->json(['error' => "File not found at: $fullPath"], 500);
        }

        // ✅ Read the file
        $file = fopen($fullPath, 'r');
        $header = fgetcsv($file); // Skip header row

        $faculty = [];
        while ($row = fgetcsv($file)) {
            $faculty[] = [
                'faculty_ID' => $row[0],
                'name' => $row[1],
                'department' => $row[2],
                'position' => $row[3],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        try {
            DB::beginTransaction();
            Faculty::insert($faculty);
            DB::commit();

            // ✅ Delete the file from private disk
            Storage::disk('private')->delete($filePath);

            return response()->json(['message' => 'Faculty successfully registered'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to register faculty: ' . $e->getMessage()], 500);
        } finally {
            fclose($file);
        }
    }


}
