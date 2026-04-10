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
        Schema::create('institution_user_program', function (Blueprint $table) {
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('user_id')->index();
            $table->foreignUlid('program_id')->index();
            $table->timestamps();

            $table->unique(['institution_id', 'user_id', 'program_id'], 'institution_user_program_unique');
        });

        Schema::create('institution_user_subject', function (Blueprint $table) {
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('user_id')->index();
            $table->foreignUlid('subject_id')->index();
            $table->timestamps();

            $table->unique(['institution_id', 'user_id', 'subject_id'], 'institution_user_subject_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institution_user_subject');
        Schema::dropIfExists('institution_user_program');
    }
};
