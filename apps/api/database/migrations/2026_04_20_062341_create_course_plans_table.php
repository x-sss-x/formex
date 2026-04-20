<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('course_plans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('program_id')->index();
            $table->foreignUlid('course_id')->index();
            $table->foreignUlid('course_coordinator_id')->constrained('users')->index();
            $table->unsignedInteger('semester');
            $table->unsignedInteger('week_no');
            $table->unsignedInteger('topic_no');
            $table->timestamp('planned_date');
            $table->timestamp('completed_date')->nullable();
            $table->text('teaching_aids')->nullable();
            $table->text('outcome')->nullable();
            $table->text('remarks')->nullable();
            $table->integer('academic_year');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_plans');
    }
};
