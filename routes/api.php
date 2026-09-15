<?php

use App\Http\Controllers\Api\AgreementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeliverableController;
use App\Http\Controllers\Api\MilestoneController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/auth/wallet', [AuthController::class, 'wallet']);
Route::get('/agreements/verify/{identifier}', [AgreementController::class, 'verify']);
Route::post('/agreements/generate-sow', [AgreementController::class, 'generateSow']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/me/role', [AuthController::class, 'updateRole']);
    Route::get('/agreements', [AgreementController::class, 'index']);
    Route::post('/agreements', [AgreementController::class, 'store']);
    Route::get('/agreements/{agreement}', [AgreementController::class, 'show']);
    Route::patch('/agreements/{agreement}', [AgreementController::class, 'update']);
    Route::delete('/agreements/{agreement}', [AgreementController::class, 'destroy']);
    Route::post('/agreements/{agreement}/lock', [AgreementController::class, 'lock']);

    Route::get('/agreements/{agreement}/milestones', [MilestoneController::class, 'index']);
    Route::post('/agreements/{agreement}/milestones', [MilestoneController::class, 'store']);
    Route::post('/agreements/{agreement}/fund', [MilestoneController::class, 'fund']);
    Route::patch('/milestones/{milestone}', [MilestoneController::class, 'update']);
    Route::post('/milestones/{milestone}/submit', [MilestoneController::class, 'submit']);
    Route::post('/milestones/{milestone}/approve', [MilestoneController::class, 'approve']);
    Route::post('/milestones/{milestone}/request-changes', [MilestoneController::class, 'requestChanges']);

    Route::post('/agreements/{agreement}/deliverables', [DeliverableController::class, 'store']);
    Route::patch('/deliverables/{deliverable}', [DeliverableController::class, 'update']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
