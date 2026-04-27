<?php

namespace App\Http\Controllers;

use App\Http\Resources\TestResource;
use App\Models\CourseOutcome;
use App\Models\Program;
use App\Models\Subject;
use App\Models\Test;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestController
{
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'semester' => ['nullable', 'integer', 'min:1', 'max:6'],
        ]);

        $query = $institution->tests()
            ->with(['program', 'courseOutcomeMarks.courseOutcome'])
            ->withSum('courseOutcomeMarks', 'assigned_marks')
            ->latest();

        if (isset($validated['semester'])) {
            $query->where('semester', (int) $validated['semester']);
        }

        return TestResource::collection($query->get());
    }

    public function listByProgram(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:6'],
        ]);
        $semester = (int) $validated['semester'];

        $tests = $program->tests()
            ->whereNull('subject_id')
            ->where('semester', $semester)
            ->with(['program', 'courseOutcomeMarks.courseOutcome'])
            ->withSum('courseOutcomeMarks', 'assigned_marks')
            ->latest()
            ->get();

        return TestResource::collection($tests);
    }

    public function listCourseOutcomesByProgramAndSemester(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:6'],
        ]);
        $semester = (int) $validated['semester'];

        $rows = CourseOutcome::query()
            ->where('program_id', $program->id)
            ->whereHas('course', fn ($query) => $query->where('semester', $semester))
            ->orderBy('name')
            ->get(['id', 'name', 'course_id'])
            ->map(fn (CourseOutcome $outcome) => [
                'id' => $outcome->id,
                'name' => $outcome->name,
                'course_id' => $outcome->course_id,
            ])
            ->values();

        return response()->json([
            'data' => $rows,
        ]);
    }

    public function listBySubject(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Subject $subject */
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();

        $tests = Test::query()
            ->where('subject_id', $subject->id)
            ->where('academic_year', $institution->academic_year)
            ->with(['program', 'courseOutcomeMarks.courseOutcome'])
            ->withSum('courseOutcomeMarks', 'assigned_marks')
            ->latest()
            ->get();

        return TestResource::collection($tests);
    }

    public function listCourseOutcomesBySubject(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Subject $subject */
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();

        $rows = CourseOutcome::query()
            ->where('program_id', $subject->program_id)
            ->where('course_id', $subject->id)
            ->orderBy('name')
            ->get(['id', 'name', 'course_id'])
            ->map(fn (CourseOutcome $outcome) => [
                'id' => $outcome->id,
                'name' => $outcome->name,
                'course_id' => $outcome->course_id,
            ])
            ->values();

        return response()->json([
            'data' => $rows,
        ]);
    }

    public function store(Request $request, Program $program): TestResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $this->validatePayload($request);
        $rows = $validated['course_outcome_marks'];
        $semester = (int) $validated['semester'];
        $this->validateCourseOutcomeRows($program, $semester, $rows);

        $test = DB::transaction(function () use ($validated, $institution, $program, $rows): Test {
            $test = $program->tests()->create([
                'institution_id' => $institution->id,
                'program_id' => $program->id,
                'subject_id' => null,
                'semester' => (int) $validated['semester'],
                'name' => $validated['name'],
                'cie_number' => (int) $validated['cie_number'],
                'maximum_marks' => (int) $validated['maximum_marks'],
                'minimum_passing_marks' => (int) $validated['minimum_passing_marks'],
                'academic_year' => $institution->academic_year,
            ]);

            foreach ($rows as $row) {
                $test->courseOutcomeMarks()->create([
                    'course_outcome_id' => $row['course_outcome_id'],
                    'assigned_marks' => (int) $row['assigned_marks'],
                ]);
            }

            return $test;
        });

        return TestResource::make($this->loadForResponse($test));
    }

    public function storeBySubject(Request $request, Subject $subject): TestResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Subject $subject */
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();
        /** @var Program $program */
        $program = $institution->programs()->whereKey($subject->program_id)->firstOrFail();

        $validated = $this->validatePayload($request);
        $rows = $validated['course_outcome_marks'];
        $semester = (int) $subject->semester;
        $this->validateCourseOutcomeRows($program, $semester, $rows, $subject);

        $test = DB::transaction(function () use ($validated, $institution, $program, $rows, $semester, $subject): Test {
            $test = $program->tests()->create([
                'institution_id' => $institution->id,
                'program_id' => $program->id,
                'subject_id' => $subject->id,
                'semester' => $semester,
                'name' => $validated['name'],
                'cie_number' => (int) $validated['cie_number'],
                'maximum_marks' => (int) $validated['maximum_marks'],
                'minimum_passing_marks' => (int) $validated['minimum_passing_marks'],
                'academic_year' => $institution->academic_year,
            ]);

            foreach ($rows as $row) {
                $test->courseOutcomeMarks()->create([
                    'course_outcome_id' => $row['course_outcome_id'],
                    'assigned_marks' => (int) $row['assigned_marks'],
                ]);
            }

            return $test;
        });

        return TestResource::make($this->loadForResponse($test));
    }

    public function show(Request $request, Test $test): TestResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($test->institution_id === $institution->id, 404);

        return TestResource::make($this->loadForResponse($test));
    }

    public function update(Request $request, Test $test): TestResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($test->institution_id === $institution->id, 404);
        /** @var Program $program */
        $program = $institution->programs()->whereKey($test->program_id)->firstOrFail();

        $validated = $this->validatePayload($request);
        $rows = $validated['course_outcome_marks'];
        $semester = (int) $validated['semester'];
        $subject = null;
        if ($test->subject_id !== null) {
            /** @var Subject $subject */
            $subject = $institution->subjects()->whereKey($test->subject_id)->firstOrFail();
        }

        $this->validateCourseOutcomeRows($program, $semester, $rows, $subject);

        DB::transaction(function () use ($test, $validated, $institution, $rows): void {
            $test->update([
                'subject_id' => $test->subject_id,
                'semester' => (int) $validated['semester'],
                'name' => $validated['name'],
                'cie_number' => (int) $validated['cie_number'],
                'maximum_marks' => (int) $validated['maximum_marks'],
                'minimum_passing_marks' => (int) $validated['minimum_passing_marks'],
                'academic_year' => $institution->academic_year,
            ]);

            $test->courseOutcomeMarks()->delete();
            foreach ($rows as $row) {
                $test->courseOutcomeMarks()->create([
                    'course_outcome_id' => $row['course_outcome_id'],
                    'assigned_marks' => (int) $row['assigned_marks'],
                ]);
            }
        });

        return TestResource::make($this->loadForResponse($test));
    }

    public function destroy(Request $request, Test $test): TestResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($test->institution_id === $institution->id, 404);

        $resource = TestResource::make($this->loadForResponse($test));
        $test->delete();

        return $resource;
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:6'],
            'name' => ['required', 'string', 'max:255'],
            'cie_number' => ['required', 'integer', 'min:1', 'max:6'],
            'maximum_marks' => ['required', 'integer', 'min:1'],
            'minimum_passing_marks' => ['required', 'integer', 'min:0'],
            'course_outcome_marks' => ['required', 'array', 'min:1'],
            'course_outcome_marks.*.course_outcome_id' => ['required', 'string', 'distinct', 'exists:course_outcomes,id'],
            'course_outcome_marks.*.assigned_marks' => ['required', 'integer', 'min:1'],
        ]);
    }

    private function validateCourseOutcomeRows(Program $program, int $semester, array $rows, ?Subject $subject = null): void
    {
        $courseOutcomeIds = collect($rows)->pluck('course_outcome_id')->unique()->values();
        $allowedCourseOutcomeQuery = CourseOutcome::query()
            ->where('program_id', $program->id)
            ->whereIn('id', $courseOutcomeIds)
            ->whereHas('course', fn ($query) => $query->where('semester', $semester));

        if ($subject !== null) {
            $allowedCourseOutcomeQuery->where('course_id', $subject->id);
        }

        $allowedCourseOutcomeIds = $allowedCourseOutcomeQuery->pluck('id');

        if ($allowedCourseOutcomeIds->count() !== $courseOutcomeIds->count()) {
            if ($subject !== null) {
                abort(422, 'One or more course outcomes do not belong to the selected subject.');
            }

            abort(422, 'One or more course outcomes do not belong to the selected program semester.');
        }
    }

    private function loadForResponse(Test $test): Test
    {
        return $test->load([
            'program',
            'courseOutcomeMarks.courseOutcome',
        ])->loadSum('courseOutcomeMarks', 'assigned_marks');
    }
}
