<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;

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
}
