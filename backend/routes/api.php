<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::apiResource('services', ServiceController::class)->only(['index']);
Route::get('appointments', [AppointmentController::class, 'index']);
Route::post('appointments', [AppointmentController::class, 'store'])->middleware('auth:sanctum');
