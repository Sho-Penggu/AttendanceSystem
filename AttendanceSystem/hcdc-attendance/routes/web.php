<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InternalUserRegisterController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/user-register', function () {
        return Inertia::render('Register');
    })->name('internal.register.form');

    Route::post('/user-register', [InternalUserRegisterController::class, 'store'])->name('internal.register');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/check-in-out', function () {
        return Inertia::render('checkInOut');
    })->name('check-in-out');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/faculty', function () {
        return Inertia::render('Faculty');
    })->name('faculty');

    Route::get('/visitors', function () {
        return Inertia::render('Visitors');
    })->name('visitors');

    Route::get('/attendance-report', function () {
        return Inertia::render('AttendanceReport');
    })->name('attendance.report');
});


//Register users page
Route::get('/student-register', function () {
    return Inertia::render('studentRegister');
})->name('student.register');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/register-user', function () {
        return Inertia::render('RegisterUser');
    })->name('register.user');
});


//Export CSV/PDF

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/attendance-report', function () {
        return Inertia::render('exports/AttendanceReport'); // Updated path
    })->name('attendance.report');
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
