<?php

namespace App\Http\Controllers;

use App\Http\Resources\SkillProgramResource;
use App\Models\Program;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use App\Models\SkillProgram;
class SkillProgramController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $skillprograms = $institution->skill_programs()
            ->with(['program', 'student'])
            ->latest()
            ->get();
        return SkillProgramResource::collection($skillprograms);
    }
    public function listByProgram(Program $program)
    {
        $skillprograms = $program->skill_programs()->with(['student'])->get();
        return SkillProgramResource::collection($skillprograms);
    }
    public function listBySemester(Program $program, int $semester)
    {
        $skillprograms = $program->skill_programs()->where('semester', $semester)->with(['student'])->get();
        return SkillProgramResource::collection($skillprograms);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'details' => 'required|string|max:255',
            'resource_person_name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'conducted_date' => 'required|date',
        ]);

        $skillprogram = $student->skill_programs()->create([
            ...$validated,
            'institution_id' => $student->institution_id,
            'program_id' => $student->program_id,
            'student_id' => $student->id,
            'semester' => $student->semester,
            'academic_year' => $institution->academic_year
        ]);

        return SkillProgramResource::make($skillprogram->load(['program', 'student']));

    }

    /**
     * Display the specified resource.
     */
    public function show(SkillProgram $skill_program)
    {
        //
        return SkillProgramResource::make($skill_program->load(['program', 'student']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SkillProgram $skill_program)
    {
        $student = $skill_program->student()->first();
        $validated = $request->validate([
            'details' => 'sometimes|required|string|max:255',
            'resource_person_name' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'designation' => 'sometimes|required|string|max:255',
            'conducted_date' => 'sometimes|required|date',
        ]);

        $skill_program->update([
            ...$validated,
            'institution_id' => $skill_program->institution_id,
            'program_id' => $skill_program->program_id,
            'student_id' => $skill_program->student_id,
            'semester' => $student?->semester ?? $skill_program->semester,
        ]);
        return SkillProgramResource::make($skill_program->load(['program', 'student']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SkillProgram $skill_program)
    {
        $skill_program->delete();
        return SkillProgramResource::make($skill_program);
    }
}
