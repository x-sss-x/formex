<?php

namespace App\Http\Controllers;

use App\Http\Resources\HigherEducationResource;
use App\Models\HigherEducation;
use App\Models\Program;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class HigherEducationController
{
    /**
     * Display a listing of the resource.
     */
    public function listByStudent(Student $student)
    {
        $higher_educations = $student->higher_educations()->with('student', 'program')->get();

        return HigherEducationResource::collection($higher_educations);
    }

    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $higher_educations = $institution->higher_educations()->with('student', 'program')->get();

        return HigherEducationResource::collection($higher_educations);
    }

    public function listByProgram(Program $program)
    {
        $higher_educations = $program->higher_educations()->with('student', 'program')->get();

        return HigherEducationResource::collection($higher_educations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $validated = $request->validate([
            'college_name' => 'required|string|max:255',
            'rank' => 'required|integer|min:1',
        ]);

        $highereducation = $student
            ->higher_educations()
            ->create(
                [
                    ...$validated,
                    'institution_id' => $student->institution->id,
                    'program_id' => $student->program->id,
                    'academic_year' => $institution->academic_year,
                ]
            );

        return response()->json([
            'message' => 'Higher Education created successfully',
            'data' => HigherEducationResource::make($highereducation->load('student', 'program')),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(HigherEducation $higher_education)
    {
        //
        return HigherEducationResource::make($higher_education->load('student', 'program'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HigherEducation $higher_education)
    {
        //
        $validated = $request->validate([
            'college_name' => 'required|string|max:255',
            'rank' => 'required|integer|min:1',
        ]);
        $higher_education->update($validated);

        return response()->json([
            'message' => 'Higher Education updated successfully',
            'data' => HigherEducationResource::make($higher_education->load('student', 'program')),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HigherEducation $higher_education)
    {
        //
        $higher_education->delete();

        return response()->json([
            'message' => 'Higher Education deleted successfully',
            'data' => HigherEducationResource::make($higher_education->load('student', 'program')),
        ]);
    }
}
