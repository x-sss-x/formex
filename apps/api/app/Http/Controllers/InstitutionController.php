<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\Request;

class InstitutionController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $institutions = Institution::all();
        return response()->json($institutions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255',
            'address' => 'required|string',
            'type' => 'required|in:government,aided,private'
        ]);

        $institution = Institution::create($validated);

        return response()->json($institution, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $institution = Institution::find($id);
        return response()->json($institution);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'code' => 'string|max:255',
            'address' => 'string',
            'type' => 'in:government,aided,private'
        ]);
        $institution = Institution::find($id);
        $institution->update($validated);
        return response()->json($institution);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $institution = Institution::find($id);
        $institution->deleteOrFail();
        return response()->json($institution);
    }
}

