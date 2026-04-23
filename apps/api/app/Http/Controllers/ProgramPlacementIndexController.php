<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\ProgramPlacementIndex;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class ProgramPlacementIndexController
{
    public function rows(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $rows = ProgramPlacementIndex::query()
            ->where('program_id', $program->id)
            ->orderByDesc('academic_year')
            ->get()
            ->map(fn (ProgramPlacementIndex $row) => [
                'academic_year' => (int) $row->academic_year,
                'total_students_count' => (int) $row->total_students_count,
                'placed_count' => (int) $row->placed_count,
                'higher_studies_count' => (int) $row->higher_studies_count,
                'entrepreneur_count' => (int) $row->entrepreneur_count,
                'weighted_total' => round(
                    (1.25 * (int) $row->placed_count) + (int) $row->higher_studies_count + (int) $row->entrepreneur_count,
                    4
                ),
                'placement_index' => (int) $row->total_students_count > 0
                    ? round(
                        ((1.25 * (int) $row->placed_count) + (int) $row->higher_studies_count + (int) $row->entrepreneur_count) / (int) $row->total_students_count,
                        4
                    )
                    : 0.0,
            ])
            ->values();

        return response()->json([
            'data' => $rows,
        ]);
    }

    public function show(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'academic_year' => ['nullable', 'integer', 'min:1900', 'max:9999'],
        ]);

        $lygYear = (int) ($validated['academic_year'] ?? $institution->academic_year ?? now()->year);
        $years = [
            ['key' => 'lyg', 'year' => $lygYear],
            ['key' => 'lyg_m1', 'year' => $lygYear - 1],
            ['key' => 'lyg_m2', 'year' => $lygYear - 2],
        ];

        $rows = $this->buildRows($program->id, $years);

        $average = round(
            (
                $rows['lyg']['placement_index'] +
                $rows['lyg_m1']['placement_index'] +
                $rows['lyg_m2']['placement_index']
            ) / 3,
            4,
        );

        return response()->json([
            'data' => [
                'program_id' => $program->id,
                'lyg' => $rows['lyg'],
                'lyg_m1' => $rows['lyg_m1'],
                'lyg_m2' => $rows['lyg_m2'],
                'average_placement_index' => $average,
            ],
        ]);
    }

    public function upsert(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.academic_year' => ['required', 'integer', 'min:1900', 'max:9999'],
            'rows.*.total_students_count' => ['required', 'integer', 'min:0'],
            'rows.*.placed_count' => ['required', 'integer', 'min:0'],
            'rows.*.higher_studies_count' => ['required', 'integer', 'min:0'],
            'rows.*.entrepreneur_count' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['rows'] as $row) {
            $totalStudents = (int) $row['total_students_count'];
            $placed = (int) $row['placed_count'];
            $higherStudies = (int) $row['higher_studies_count'];
            $entrepreneur = (int) $row['entrepreneur_count'];

            if (($placed + $higherStudies + $entrepreneur) > $totalStudents) {
                abort(422, 'Placed + higher studies + entrepreneur cannot exceed total students.');
            }

            ProgramPlacementIndex::query()->updateOrCreate(
                [
                    'program_id' => $program->id,
                    'academic_year' => (int) $row['academic_year'],
                ],
                [
                    'total_students_count' => $totalStudents,
                    'placed_count' => $placed,
                    'higher_studies_count' => $higherStudies,
                    'entrepreneur_count' => $entrepreneur,
                ],
            );
        }

        return $this->show($request, $program);
    }

    /**
     * @return array{
     *   total_students_count: int,
     *   placed_count: int,
     *   higher_studies_count: int,
     *   entrepreneur_count: int,
     *   weighted_total: float,
     *   placement_index: float
     * }
     */
    private function metricsForYear(string $programId, int $academicYear): array
    {
        $row = ProgramPlacementIndex::query()
            ->where('program_id', $programId)
            ->where('academic_year', $academicYear)
            ->first();

        $totalStudents = (int) ($row?->total_students_count ?? 0);
        $placed = (int) ($row?->placed_count ?? 0);
        $higherStudies = (int) ($row?->higher_studies_count ?? 0);
        $entrepreneur = (int) ($row?->entrepreneur_count ?? 0);
        $weightedTotal = round((1.25 * $placed) + $higherStudies + $entrepreneur, 4);
        $placementIndex = $totalStudents > 0 ? round($weightedTotal / $totalStudents, 4) : 0.0;

        return [
            'total_students_count' => $totalStudents,
            'placed_count' => $placed,
            'higher_studies_count' => $higherStudies,
            'entrepreneur_count' => $entrepreneur,
            'weighted_total' => $weightedTotal,
            'placement_index' => $placementIndex,
        ];
    }

    /**
     * @param  array<int, array{key: string, year: int}>  $years
     * @return array{
     *   lyg: array{academic_year: int, total_students_count: int, placed_count: int, higher_studies_count: int, entrepreneur_count: int, weighted_total: float, placement_index: float},
     *   lyg_m1: array{academic_year: int, total_students_count: int, placed_count: int, higher_studies_count: int, entrepreneur_count: int, weighted_total: float, placement_index: float},
     *   lyg_m2: array{academic_year: int, total_students_count: int, placed_count: int, higher_studies_count: int, entrepreneur_count: int, weighted_total: float, placement_index: float}
     * }
     */
    private function buildRows(string $programId, array $years): array
    {
        $rows = [];
        foreach ($years as $entry) {
            $metrics = $this->metricsForYear($programId, $entry['year']);
            $rows[$entry['key']] = [
                'academic_year' => $entry['year'],
                ...$metrics,
            ];
        }

        return $rows;
    }
}
