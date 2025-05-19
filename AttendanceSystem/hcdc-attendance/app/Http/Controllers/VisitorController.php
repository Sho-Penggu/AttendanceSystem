<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VisitorController extends Controller
{
    public function index()
    {
        return response()->json(Visitor::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'purpose' => 'nullable|string',
        ]);

        $visitor = Visitor::create($request->all());

        return response()->json(['message' => 'Visitor recorded', 'data' => $visitor], 201);
    }

    public function update(Request $request, $id)
    {
        $visitor = Visitor::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string',
            'purpose' => 'sometimes|string',
        ]);

        $visitor->update($request->all());

        return response()->json(['message' => 'Visitor updated', 'data' => $visitor]);
    }

    public function destroy($id)
    {
        $visitor = Visitor::findOrFail($id);
        $visitor->delete();

        return response()->json(['message' => 'Visitor deleted']);
    }

    //SHow by ID
    public function show($id)
    {
        $visitor = Visitor::findOrFail($id);
        return response()->json($visitor);
    }

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

        $visitor = [];
        while ($row = fgetcsv($file)) {
            $visitor[] = [
                'name' => $row[0],
                'purpose' => $row[1],
                'organization' => $row[2],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        try {
            DB::beginTransaction();
            Visitor::insert($visitor);
            DB::commit();

            // ✅ Delete the file from private disk
            Storage::disk('private')->delete($filePath);

            return response()->json(['message' => 'Visitor successfully registered'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to register visitor: ' . $e->getMessage()], 500);
        } finally {
            fclose($file);
        }
    }
}
