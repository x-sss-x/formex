<?php

namespace App\Http\Controllers;

use App\Http\Resources\CoursePlanResource;
use App\Models\CoursePlan;
use App\Models\Subject;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CoursePlanController
{
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $coursePlans = $institution
            ->course_plans()
            ->with(['program', 'course', 'course_coordinator'])
            ->latest()
            ->get();

        return CoursePlanResource::collection($coursePlans);
    }

    public function listByCourse(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Subject $subject */
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();

        $coursePlans = $subject
            ->course_plans()
            ->with(['program', 'course', 'course_coordinator'])
            ->latest()
            ->get();

        return CoursePlanResource::collection($coursePlans);
    }

    public function store(Request $request, Subject $subject): CoursePlanResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Subject $subject */
        $subject = $institution->subjects()->whereKey($subject->id)->with('assigned_staff')->firstOrFail();

        $validated = $request->validate([
            'course_coordinator_id' => ['required', 'ulid', 'exists:users,id'],
            'week_no' => ['required', 'integer', 'min:1'],
            'topic_no' => ['required', 'integer', 'min:1'],
            'planned_date' => ['required', 'date'],
            'completed_date' => ['nullable', 'date'],
            'teaching_aids' => ['nullable', 'string'],
            'outcome' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
        ]);

        $assignedStaffIds = $subject->assigned_staff->pluck('id');
        if (! $assignedStaffIds->contains($validated['course_coordinator_id'])) {
            throw new HttpException(422, 'Selected course coordinator is not allotted to this course.');
        }

        $coursePlan = $subject->course_plans()->create([
            ...$validated,
            'institution_id' => $subject->institution_id,
            'program_id' => $subject->program_id,
            'course_id' => $subject->id,
            'semester' => $subject->semester,
            'academic_year' => $institution->academic_year,
        ]);

        return CoursePlanResource::make($coursePlan->loadMissing(['program', 'course', 'course_coordinator']));
    }

    /**
     * @urlParam coursePlan string required The course plan ID.
     */
    public function show(Request $request, CoursePlan $coursePlan): CoursePlanResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($coursePlan->institution_id === $institution->id, 404);

        return CoursePlanResource::make($coursePlan->loadMissing(['program', 'course', 'course_coordinator']));
    }

    /**
     * @urlParam coursePlan string required The course plan ID.
     */
    public function update(Request $request, CoursePlan $coursePlan): CoursePlanResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($coursePlan->institution_id === $institution->id, 404);

        $validated = $request->validate([
            'course_coordinator_id' => ['required', 'ulid', 'exists:users,id'],
            'week_no' => ['required', 'integer', 'min:1'],
            'topic_no' => ['required', 'integer', 'min:1'],
            'planned_date' => ['required', 'date'],
            'completed_date' => ['nullable', 'date'],
            'teaching_aids' => ['nullable', 'string'],
            'outcome' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
            'academic_year' => ['required', 'integer'],
        ]);

        $subject = Subject::query()->whereKey($coursePlan->course_id)->with('assigned_staff')->firstOrFail();
        $assignedStaffIds = $subject->assigned_staff->pluck('id');
        if (! $assignedStaffIds->contains($validated['course_coordinator_id'])) {
            throw new HttpException(422, 'Selected course coordinator is not allotted to this course.');
        }

        $coursePlan->update([
            ...$validated,
            'semester' => $subject->semester,
        ]);

        return CoursePlanResource::make($coursePlan->loadMissing(['program', 'course', 'course_coordinator']));
    }

    /**
     * @urlParam coursePlan string required The course plan ID.
     */
    public function destroy(Request $request, CoursePlan $coursePlan): CoursePlanResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($coursePlan->institution_id === $institution->id, 404);

        $coursePlan->delete();

        return CoursePlanResource::make($coursePlan->loadMissing(['program', 'course', 'course_coordinator']));
    }
}
