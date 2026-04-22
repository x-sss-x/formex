<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourseMonthlyAttendanceResource;
use App\Models\CourseMonthlyAttendance;
use App\Models\Student;
use App\Models\Subject;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CourseMonthlyAttendanceController
{
    public function listByCourse(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Subject $subject */
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();

        $rows = $subject
            ->course_monthly_attendances()
            ->with(['attendance_students.student', 'program', 'course'])
            ->orderByDesc('academic_year')
            ->orderByDesc('month')
            ->get()
            ->each->withAttendanceContext();

        return CourseMonthlyAttendanceResource::collection($rows);
    }

    public function store(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Subject $subject */
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();

        $validated = $this->validatePayload($request, $institution->academic_year);
        $academicYear = (int) $institution->academic_year;

        if (
            CourseMonthlyAttendance::query()
                ->where('course_id', $subject->id)
                ->where('month', $validated['month'])
                ->where('academic_year', $validated['academic_year'])
                ->exists()
        ) {
            abort(422, 'Attendance for this month and academic year is already recorded for this course.');
        }

        $this->assertStudentsAllowedForSubject($subject, $validated['students'], $academicYear);

        $row = DB::transaction(function () use ($subject, $institution, $validated, $academicYear) {
            $attendance = CourseMonthlyAttendance::query()->create([
                'institution_id' => $institution->id,
                'program_id' => $subject->program_id,
                'course_id' => $subject->id,
                'month' => $validated['month'],
                'academic_year' => $academicYear,
                'total_classes_held' => $validated['total_classes_held'],
                'minimum_attendance_percent' => $validated['minimum_attendance_percent'],
            ]);

            foreach ($validated['students'] as $line) {
                $attendance->attendance_students()->create([
                    'student_id' => $line['student_id'],
                    'total_classes_attended' => $line['total_classes_attended'],
                    'remarks' => $line['remarks'] ?? null,
                ]);
            }

            return $attendance
                ->load(['attendance_students.student', 'program', 'course'])
                ->withAttendanceContext();
        });

        return CourseMonthlyAttendanceResource::make($row)->response()->setStatusCode(201);
    }

    public function show(Request $request, CourseMonthlyAttendance $courseMonthlyAttendance): CourseMonthlyAttendanceResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($courseMonthlyAttendance->institution_id === $institution->id, 404);

        $courseMonthlyAttendance
            ->load(['attendance_students.student', 'program', 'course'])
            ->withAttendanceContext();

        return CourseMonthlyAttendanceResource::make($courseMonthlyAttendance);
    }

    public function update(Request $request, CourseMonthlyAttendance $courseMonthlyAttendance): CourseMonthlyAttendanceResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($courseMonthlyAttendance->institution_id === $institution->id, 404);

        $validated = $this->validatePayload($request, (int) $institution->academic_year);
        $academicYear = (int) $institution->academic_year;

        if (
            (int) $validated['month'] !== (int) $courseMonthlyAttendance->month
            || (int) $validated['academic_year'] !== (int) $courseMonthlyAttendance->academic_year
        ) {
            abort(422, 'You cannot change month or academic year; delete and re-create this entry if it was a mistake.');
        }

        $subject = Subject::query()
            ->where('institution_id', $institution->id)
            ->whereKey($courseMonthlyAttendance->course_id)
            ->firstOrFail();

        $this->assertStudentsAllowedForSubject($subject, $validated['students'], $academicYear);

        $row = DB::transaction(function () use ($courseMonthlyAttendance, $validated) {
            $courseMonthlyAttendance->update([
                'total_classes_held' => $validated['total_classes_held'],
                'minimum_attendance_percent' => $validated['minimum_attendance_percent'],
            ]);
            $courseMonthlyAttendance->attendance_students()->delete();

            foreach ($validated['students'] as $line) {
                $courseMonthlyAttendance->attendance_students()->create([
                    'student_id' => $line['student_id'],
                    'total_classes_attended' => $line['total_classes_attended'],
                    'remarks' => $line['remarks'] ?? null,
                ]);
            }

            $courseMonthlyAttendance
                ->load(['attendance_students.student', 'program', 'course'])
                ->withAttendanceContext();

            return $courseMonthlyAttendance;
        });

        return CourseMonthlyAttendanceResource::make($row);
    }

    public function destroy(Request $request, CourseMonthlyAttendance $courseMonthlyAttendance): CourseMonthlyAttendanceResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($courseMonthlyAttendance->institution_id === $institution->id, 404);

        $courseMonthlyAttendance->delete();

        return CourseMonthlyAttendanceResource::make($courseMonthlyAttendance->loadMissing(['program', 'course']));
    }

    /**
     * @return array{month: int, academic_year: int, total_classes_held: int, minimum_attendance_percent: float, students: array<int, array{student_id: string, total_classes_attended: int, remarks: string|null}>}
     */
    private function validatePayload(Request $request, int $institutionAcademicYear): array
    {

        $validated = $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'academic_year' => ['required', 'integer', 'min:2000', 'max:2100', Rule::in([$institutionAcademicYear])],
            'total_classes_held' => ['required', 'integer', 'min:1', 'max:10000'],
            'minimum_attendance_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'students' => ['required', 'array', 'min:1'],
            'students.*.student_id' => ['required', 'ulid', 'exists:students,id'],
            'students.*.total_classes_attended' => ['required', 'integer', 'min:0'],
            'students.*.remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $ids = array_column($validated['students'], 'student_id');
        if (count($ids) !== count(array_unique($ids))) {
            abort(422, 'Duplicate students in the submission.');
        }

        $held = (int) $validated['total_classes_held'];
        foreach ($validated['students'] as $i => $line) {
            if ((int) $line['total_classes_attended'] > $held) {
                abort(422, "students.{$i}.total_classes_attended may not be greater than total classes held.");
            }
        }

        return $validated;
    }

    /**
     * @param  array<int, array{student_id: string, total_classes_attended: int, remarks?: string|null}>  $lines
     */
    private function assertStudentsAllowedForSubject(Subject $subject, array $lines, int $academicYear): void
    {
        $ids = array_column($lines, 'student_id');
        $semester = (int) $subject->semester;

        $validIds = Student::query()
            ->where('institution_id', $subject->institution_id)
            ->where('program_id', $subject->program_id)
            ->where('semester', $semester)
            ->where('academic_year', $academicYear)
            ->whereIn('id', $ids)
            ->pluck('id')
            ->all();

        sort($validIds);
        $sorted = $ids;
        sort($sorted);

        if ($validIds !== $sorted) {
            abort(422, 'Each student must belong to this course (same program, semester, and current academic year).');
        }
    }
}
