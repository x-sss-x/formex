<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_monthly_attendances', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('program_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('course_id')->constrained('subjects')->cascadeOnDelete();
            $table->unsignedTinyInteger('month');
            $table->integer('academic_year');
            $table->unsignedInteger('total_classes_held');
            $table->decimal('minimum_attendance_percent', 5, 2);
            $table->timestamps();

            $table->unique(
                ['course_id', 'month', 'academic_year'],
                'course_mthly_att_cid_month_ayear_uq',
            );
        });

        Schema::create('course_monthly_attendance_students', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table
                ->foreignUlid('course_monthly_attendance_id')
                ->constrained('course_monthly_attendances')
                ->cascadeOnDelete();
            $table->foreignUlid('student_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('total_classes_attended');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(
                ['course_monthly_attendance_id', 'student_id'],
                'course_mthly_att_students_attid_sid_uq',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_monthly_attendance_students');
        Schema::dropIfExists('course_monthly_attendances');
    }
};
