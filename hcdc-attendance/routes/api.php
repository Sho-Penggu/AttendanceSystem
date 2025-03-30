<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::post('/check-in', [AttendanceController::class, 'checkIn']);
Route::post('/check-out', [AttendanceController::class, 'checkOut']);
Route::get('/attendance', [AttendanceController::class, 'index']);
Route::put('/attendance/{id}/update', [AttendanceController::class, 'updateAttendance']);
Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy']);

