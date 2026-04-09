<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::apiResource('services', ServiceController::class)->only(['index']);
Route::apiResource('appointments', AppointmentController::class)->only(['index', 'store']);
