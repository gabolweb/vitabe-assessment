<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::apiResource('services', ServiceController::class)->only(['index']);
Route::get('appointments', [AppointmentController::class, 'index']);

Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('appointments', [AppointmentController::class, 'store']);
    Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy']);
});
