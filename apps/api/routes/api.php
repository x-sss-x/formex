<?php

use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use Illuminate\Support\Facades\Route;

Route::apiResource('institutions', InstitutionController::class);
Route::apiResource('institutions.programs', ProgramController::class);
