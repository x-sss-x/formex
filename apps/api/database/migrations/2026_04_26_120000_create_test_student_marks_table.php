<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_student_marks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('program_id')->index();
            $table->foreignUlid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUlid('test_id')->constrained('tests')->cascadeOnDelete();
            $table->foreignUlid('course_outcome_id')->constrained('course_outcomes')->cascadeOnDelete();
            $table->unsignedInteger('marks');
            $table->integer('academic_year');
            $table->timestamps();

            $table->unique(['student_id', 'test_id', 'course_outcome_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_student_marks');
    }
};
