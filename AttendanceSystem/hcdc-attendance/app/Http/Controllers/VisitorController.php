<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;

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
}
