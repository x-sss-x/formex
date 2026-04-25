<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('co_po_pso_strengths', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('program_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('course_outcome_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('program_outcome_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('semester');
            $table->unsignedTinyInteger('strength');
            $table->unsignedSmallInteger('academic_year');
            $table->timestamps();

            $table->unique(
                ['program_id', 'semester', 'course_outcome_id', 'program_outcome_id'],
                'co_po_pso_strengths_unique_mapping',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('co_po_pso_strengths');
    }
};
