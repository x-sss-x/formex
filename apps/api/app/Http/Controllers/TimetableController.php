<?php

namespace App\Http\Controllers;

use App\Http\Resources\TimetablePersonalResource;
use App\Http\Resources\TimetableShowResource;
use App\Http\Resources\TimetableUpsertSlotResponseResource;
use App\Models\Program;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TimeTable;
use App\Models\TimeTableSlot;
use App\Models\TimeTableSlotSubject;
use App\Models\User;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TimetableController
{
    private const array DAYS = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    private const array ALLOWED_PERSONAL_TIMETABLE_ROLES = [
        'course_coordinator',
        'program_coordinator',
    ];

    public function show(Request $request, Program $program): JsonResponse
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $timeTable = $program->time_tables()
            ->where('semester', $validated['semester'])
            ->where('academic_year', $institution->academic_year)
            ->with([
                'time_table_slots' => function ($query): void {
                    $query->orderBy('day')->orderBy('start_hour_no');
                },
                'time_table_slots.subjects.subject:id,name,short_name',
                'time_table_slots.subjects.course_coordinator:id,name',
            ])
            ->first();

        $payload = [
            'id' => $timeTable?->id,
            'semester' => (int) $validated['semester'],
            'academic_year' => (int) $institution->academic_year,
            'slots' => $timeTable === null
                ? []
                : $this->orderSlots($timeTable->time_table_slots->all()),
        ];

        return TimetableShowResource::make($payload)->response();
    }

    public function upsertSlot(Request $request, Program $program): JsonResponse
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:12'],
            'day' => ['required', Rule::in(self::DAYS)],
            'start_hour_no' => ['required', 'integer', 'min:1', 'max:7'],
            'end_hour_no' => ['required', 'integer', 'min:1', 'max:7', 'gte:start_hour_no'],
            'subjects' => ['required', 'array', 'min:1', 'max:10'],
            'subjects.*.subject_id' => ['required', 'string'],
            'subjects.*.course_coordinator_id' => ['required', 'string'],
            'subjects.*.batch' => ['required', 'string', 'max:255'],
            'subjects.*.room_no' => ['required', 'string', 'max:255'],
        ]);

        if ($validated['start_hour_no'] <= 4 && $validated['end_hour_no'] >= 5) {
            return response()->json([
                'message' => 'Slot cannot cross lunch break.',
            ], 422);
        }

        $subjectIds = collect($validated['subjects'])->pluck('subject_id')->unique()->values();
        $coordinatorIds = collect($validated['subjects'])->pluck('course_coordinator_id')->unique()->values();

        $allowedSubjectIds = Subject::query()
            ->where('institution_id', $institution->id)
            ->where('program_id', $program->id)
            ->whereIn('id', $subjectIds)
            ->pluck('id');
        if ($allowedSubjectIds->count() !== $subjectIds->count()) {
            return response()->json([
                'message' => 'One or more subjects are invalid for this program.',
            ], 422);
        }

        $allowedCoordinatorIds = User::query()
            ->whereIn('id', $coordinatorIds)
            ->whereHas('institutions', function ($query) use ($institution): void {
                $query->where('institutions.id', $institution->id);
            })
            ->pluck('id');
        if ($allowedCoordinatorIds->count() !== $coordinatorIds->count()) {
            return response()->json([
                'message' => 'One or more coordinators are invalid for this institution.',
            ], 422);
        }

        /** @var TimeTableSlot $slot */
        $slot = DB::transaction(function () use ($institution, $program, $validated): TimeTableSlot {
            $timeTable = TimeTable::query()->firstOrCreate([
                'program_id' => $program->id,
                'semester' => $validated['semester'],
                'academic_year' => $institution->academic_year,
            ]);

            $existingSlot = TimeTableSlot::query()
                ->where('time_table_id', $timeTable->id)
                ->where('day', $validated['day'])
                ->where('start_hour_no', $validated['start_hour_no'])
                ->first();

            $overlapQuery = TimeTableSlot::query()
                ->where('time_table_id', $timeTable->id)
                ->where('day', $validated['day'])
                ->where('start_hour_no', '<=', $validated['end_hour_no'])
                ->where('end_hour_no', '>=', $validated['start_hour_no']);

            if ($existingSlot !== null) {
                $overlapQuery->whereKeyNot($existingSlot->id);
            }

            if ($overlapQuery->exists()) {
                throw ValidationException::withMessages([
                    'slot' => 'This range overlaps an existing slot.',
                ]);
            }

            $slot = TimeTableSlot::query()->updateOrCreate(
                [
                    'time_table_id' => $timeTable->id,
                    'day' => $validated['day'],
                    'start_hour_no' => $validated['start_hour_no'],
                ],
                [
                    'end_hour_no' => $validated['end_hour_no'],
                ],
            );

            $slot->subjects()->delete();

            foreach ($validated['subjects'] as $subjectData) {
                $slot->subjects()->create([
                    'subject_id' => $subjectData['subject_id'],
                    'course_coordinator_id' => $subjectData['course_coordinator_id'],
                    'batch' => $subjectData['batch'],
                    'room_no' => $subjectData['room_no'],
                ]);
            }

            return $slot;
        });

        $slot->load([
            'subjects.subject:id,name,short_name',
            'subjects.course_coordinator:id,name',
        ]);

        return TimetableUpsertSlotResponseResource::make([
            'message' => 'Timetable slot saved successfully.',
            'data' => $slot,
        ])->response();
    }

    public function personal(Request $request): JsonResponse
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $role = CurrentInstitutionSession::requireRole($request);
        $user = $request->user();

        if (! in_array($role, self::ALLOWED_PERSONAL_TIMETABLE_ROLES, true)) {
            abort(403);
        }

        $slotSubjects = $this->loadPersonalSlotSubjects(
            userId: (string) $user->id,
            institutionId: (string) $institution->id,
            academicYear: (int) $institution->academic_year,
        );
        $studentCounts = $this->loadStudentCountsForPersonalTimetable(
            slotSubjects: $slotSubjects,
            institutionId: (string) $institution->id,
            academicYear: (int) $institution->academic_year,
        );
        $groupedRows = $this->buildPersonalTimetableRows($slotSubjects, $studentCounts);

        return TimetablePersonalResource::make([
            'academic_year' => (int) $institution->academic_year,
            'days' => self::DAYS,
            'rows' => array_values($groupedRows),
        ])->response();
    }

    /**
     * @return Collection<int, TimeTableSlotSubject>
     */
    private function loadPersonalSlotSubjects(
        string $userId,
        string $institutionId,
        int $academicYear,
    ) {
        return TimeTableSlotSubject::query()
            ->where('course_coordinator_id', $userId)
            ->whereHas('slot.time_table.program', function ($query) use ($institutionId): void {
                $query->where('institution_id', $institutionId);
            })
            ->whereHas('slot.time_table', function ($query) use ($academicYear): void {
                $query->where('academic_year', $academicYear);
            })
            ->with([
                'slot.time_table.program:id,name',
                'subject:id,name',
            ])
            ->get();
    }

    /**
     * @param  Collection<int, TimeTableSlotSubject>  $slotSubjects
     * @return array<string, int>
     */
    private function loadStudentCountsForPersonalTimetable(
        $slotSubjects,
        string $institutionId,
        int $academicYear,
    ): array {
        $programIds = $slotSubjects
            ->map(fn (TimeTableSlotSubject $entry): ?string => $entry->slot?->time_table?->program_id)
            ->filter()
            ->unique()
            ->values();

        return Student::query()
            ->selectRaw('program_id, semester, count(*) as total')
            ->where('institution_id', $institutionId)
            ->where('academic_year', $academicYear)
            ->whereIn('program_id', $programIds->all())
            ->groupBy('program_id', 'semester')
            ->get()
            ->mapWithKeys(function ($row): array {
                return [sprintf('%s|%d', $row->program_id, (int) $row->semester) => (int) $row->total];
            })
            ->all();
    }

    /**
     * @param  Collection<int, TimeTableSlotSubject>  $slotSubjects
     * @param  array<string, int>  $studentCounts
     * @return array<string, array{
     *  sl_no:int,
     *  program_name:string,
     *  semester:int,
     *  course_name:string,
     *  no_of_students:int,
     *  room_no:string,
     *  day_slots:array<string, array<int, bool>>
     * }>
     */
    private function buildPersonalTimetableRows($slotSubjects, array $studentCounts): array
    {
        /** @var array<string, array{
         *  sl_no:int,
         *  program_name:string,
         *  semester:int,
         *  course_name:string,
         *  no_of_students:int,
         *  room_no:string,
         *  day_slots:array<string, array<int, bool>>
         * }> $groupedRows
         */
        $groupedRows = [];
        $slNo = 1;

        foreach ($slotSubjects as $entry) {
            $slot = $entry->slot;
            $timeTable = $slot?->time_table;
            $program = $timeTable?->program;
            $subject = $entry->subject;

            if ($slot === null || $timeTable === null || $program === null || $subject === null) {
                continue;
            }

            $groupKey = implode('|', [
                $program->id,
                (string) $timeTable->semester,
                $subject->id,
                $entry->room_no,
            ]);

            if (! isset($groupedRows[$groupKey])) {
                $studentCountKey = sprintf('%s|%d', $program->id, $timeTable->semester);
                $groupedRows[$groupKey] = [
                    'sl_no' => $slNo++,
                    'program_name' => $program->name,
                    'semester' => $timeTable->semester,
                    'course_name' => sprintf('%s (%s)', $subject->name, $entry->batch),
                    'no_of_students' => $studentCounts[$studentCountKey] ?? 0,
                    'room_no' => $entry->room_no,
                    'day_slots' => collect(self::DAYS)->mapWithKeys(
                        fn (string $day): array => [$day => []]
                    )->all(),
                ];
            }

            for ($hour = $slot->start_hour_no; $hour <= $slot->end_hour_no; $hour += 1) {
                $groupedRows[$groupKey]['day_slots'][$slot->day][$hour] = true;
            }
        }

        return $groupedRows;
    }

    /**
     * @param  list<TimeTableSlot>  $slots
     * @return list<TimeTableSlot>
     */
    private function orderSlots(array $slots): array
    {
        $dayOrder = array_flip(self::DAYS);

        return collect($slots)
            ->sortBy(fn (TimeTableSlot $slot): string => sprintf(
                '%02d-%02d',
                $dayOrder[$slot->day] ?? 99,
                (int) $slot->start_hour_no,
            ))
            ->values()
            ->all();
    }
}
