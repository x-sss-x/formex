<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_placement_indices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('program_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('academic_year');
            $table->unsignedInteger('total_students_count')->default(0);
            $table->unsignedInteger('placed_count')->default(0);
            $table->unsignedInteger('higher_studies_count')->default(0);
            $table->unsignedInteger('entrepreneur_count')->default(0);
            $table->timestamps();

            $table->unique(['program_id', 'academic_year'], 'program_placement_indices_program_year_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_placement_indices');
    }
};
