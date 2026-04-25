<?php

namespace App\Http\Controllers;

use App\Models\CoPoPsoStrength;
use App\Models\CourseOutcome;
use App\Models\Program;
use App\Models\ProgramOutcome;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class CoPoPsoStrengthController
{
    public function listByProgramAndSemester(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();
        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:6'],
        ]);
        $semester = (int) $validated['semester'];

        $rows = CoPoPsoStrength::query()
            ->where('program_id', $program->id)
            ->where('semester', $semester)
            ->orderBy('course_outcome_id')
            ->orderBy('program_outcome_id')
            ->get()
            ->map(fn (CoPoPsoStrength $row) => [
                'course_outcome_id' => $row->course_outcome_id,
                'program_outcome_id' => $row->program_outcome_id,
                'semester' => (int) $row->semester,
                'strength' => (int) $row->strength,
            ])
            ->values();

        return response()->json([
            'data' => $rows,
        ]);
    }

    public function upsert(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();
        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:6'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.course_outcome_id' => ['required', 'string', 'exists:course_outcomes,id'],
            'rows.*.program_outcome_id' => ['required', 'string', 'exists:program_outcomes,id'],
            'rows.*.strength' => ['required', 'integer', 'min:1', 'max:3'],
        ]);
        $semester = (int) $validated['semester'];
        $rowPayloads = $validated['rows'];

        $courseOutcomeIds = collect($rowPayloads)
            ->pluck('course_outcome_id')
            ->unique()
            ->values();
        $programOutcomeIds = collect($rowPayloads)
            ->pluck('program_outcome_id')
            ->unique()
            ->values();

        $allowedCourseOutcomeIds = CourseOutcome::query()
            ->where('program_id', $program->id)
            ->whereIn('id', $courseOutcomeIds)
            ->whereHas('course', fn ($query) => $query->where('semester', $semester))
            ->pluck('id');
        if ($allowedCourseOutcomeIds->count() !== $courseOutcomeIds->count()) {
            abort(422, 'One or more course outcomes do not belong to the selected program semester.');
        }

        $allowedProgramOutcomeIds = ProgramOutcome::query()
            ->where('program_id', $program->id)
            ->whereIn('id', $programOutcomeIds)
            ->whereIn('type', ['program_outcome', 'program_specific_outcome'])
            ->pluck('id');
        if ($allowedProgramOutcomeIds->count() !== $programOutcomeIds->count()) {
            abort(422, 'One or more program outcomes are invalid for CO mapping.');
        }

        foreach ($rowPayloads as $row) {
            CoPoPsoStrength::query()->updateOrCreate(
                [
                    'program_id' => $program->id,
                    'semester' => $semester,
                    'course_outcome_id' => $row['course_outcome_id'],
                    'program_outcome_id' => $row['program_outcome_id'],
                ],
                [
                    'institution_id' => $institution->id,
                    'academic_year' => $institution->academic_year,
                    'strength' => (int) $row['strength'],
                ],
            );
        }

        return $this->listByProgramAndSemester($request, $program);
    }
}
