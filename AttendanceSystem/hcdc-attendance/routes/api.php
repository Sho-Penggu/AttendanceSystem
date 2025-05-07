<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\VisitorController;

// ✅ Attendance Routes
Route::post('/check-in', [AttendanceController::class, 'checkIn']);
Route::post('/check-out', [AttendanceController::class, 'checkOut']);
Route::get('/attendance', [AttendanceController::class, 'index']);
Route::put('/attendance/{id}/update', [AttendanceController::class, 'updateAttendance']);
Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy']);
Route::post('/attendance/filter', [AttendanceController::class, 'filterByDate']); // optional if you want filtering


// ✅ Student CRUD
Route::apiResource('students', StudentController::class)->only(['index', 'store', 'update', 'destroy', 'show']);

// ✅ Faculty CRUD
Route::apiResource('faculty', FacultyController::class)->only(['index', 'store', 'update', 'destroy', 'show']);

// ✅ Visitor CRUD
Route::apiResource('visitors', VisitorController::class)->only(['index', 'store', 'update', 'destroy', 'show']);

//Upload CSV
Route::post('/students/csv-upload', [StudentController::class, 'storeFromCSV']);
