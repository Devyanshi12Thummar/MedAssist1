<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\AuthController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

// Public routes
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Add these routes for email verification
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return response()->json(['message' => 'Email verified successfully']);
})->middleware(['auth:sanctum', 'signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification link sent']);
})->middleware(['auth:sanctum', 'throttle:6,1'])->name('verification.send');

Route::post('/email/resend', function (Request $request) {
    $user = \App\Models\User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified.'], 400);
    }

    $user->sendEmailVerificationNotification();

    return response()->json(['message' => 'Verification email resent.']);
});


// Add these routes in your public routes section

// Route::post('/auth/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
// Route::post('/auth/reset-password', [ResetPasswordController::class, 'reset']);

Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Doctor routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/doctors', [DoctorController::class, 'index']);
    Route::get('/doctors/profile', [DoctorController::class, 'getProfile']);
    Route::get('/doctors/{id}', [DoctorController::class, 'show']);
    Route::patch('/doctors/{id}', [DoctorController::class, 'update']);
    Route::delete('/doctors/{id}', [DoctorController::class, 'destroy']);
    Route::get('/doctors/search', [DoctorController::class, 'search']);
});
    
    // Patient-only routes
    Route::middleware('role:patient')->prefix('patients')->group(function () {
        Route::get('/profile', [PatientController::class, 'getProfile']);
        Route::patch('/{id}', [PatientController::class, 'update']); // Removed redundant middleware
        Route::get('/{id}/medical-history', [PatientController::class, 'getMedicalHistory']);
        Route::post('/{id}/appointments', [PatientController::class, 'bookAppointment']);
        Route::get('/{id}/appointments', [PatientController::class, 'getAppointments']);
    });
    
    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/patients', [PatientController::class, 'getAllPatients']);
        Route::get('/patients/search', [PatientController::class, 'search']);
        Route::delete('/patients/{id}', [PatientController::class, 'destroy']);
        Route::post('/patients/{id}/medical-history', [PatientController::class, 'addMedicalHistory']);
        
        Route::delete('/doctors/{id}', [DoctorController::class, 'destroy']);
    });
});
