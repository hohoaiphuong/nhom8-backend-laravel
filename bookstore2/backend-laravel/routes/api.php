<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UploadController;

Route::get('/health', function () {
    return response()->json(['status' => 'API is running!']);
});

// Upload Routes
Route::prefix('upload')->group(function () {
    Route::post('book-image', [UploadController::class, 'uploadBookImage']);
    Route::delete('book-image', [UploadController::class, 'deleteBookImage']);
});

// Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('profile/{id}', [AuthController::class, 'profile']);
    Route::put('profile/{id}', [AuthController::class, 'updateProfile']);
});

// Protected User Routes (require token)
Route::middleware('auth.token')->group(function () {
    Route::get('/user', [AuthController::class, 'getCurrentUser']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// Book Routes
Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);
    Route::get('{id}', [BookController::class, 'show']);
    Route::post('/', [BookController::class, 'store']);
    Route::put('{id}', [BookController::class, 'update']);
    Route::delete('{id}', [BookController::class, 'destroy']);
});

// Category Routes
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('{id}', [CategoryController::class, 'show']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::put('{id}', [CategoryController::class, 'update']);
    Route::delete('{id}', [CategoryController::class, 'destroy']);
});

// Order Routes
Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::get('user/{userId}', [OrderController::class, 'index']);
    Route::get('{id}', [OrderController::class, 'show']);
    Route::post('/', [OrderController::class, 'store']);
    Route::put('{id}/status', [OrderController::class, 'updateStatus']);
    Route::delete('{id}', [OrderController::class, 'destroy']);
});

// Cart Routes
Route::prefix('cart')->group(function () {
    Route::get('user/{userId}', [CartController::class, 'show']);
    Route::post('user/{userId}/add', [CartController::class, 'addItem']);
    Route::put('user/{userId}/item/{itemId}', [CartController::class, 'updateItem']);
    Route::delete('user/{userId}/item/{itemId}', [CartController::class, 'removeItem']);
    Route::delete('user/{userId}/clear', [CartController::class, 'clear']);
});

// Cart Admin Routes
Route::prefix('carts')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::get('{cartId}', [CartController::class, 'showCart']);
    Route::delete('{cartId}/items/{itemId}', [CartController::class, 'removeItemAdmin']);
    Route::put('{cartId}/items/{itemId}', [CartController::class, 'updateItemAdmin']);
    Route::delete('{cartId}', [CartController::class, 'clearAdmin']);
});

// Address Routes
Route::prefix('addresses')->group(function () {
    Route::get('user/{userId}', [AddressController::class, 'index']);
    Route::get('{id}', [AddressController::class, 'show']);
    Route::post('/', [AddressController::class, 'store']);
    Route::put('{id}', [AddressController::class, 'update']);
    Route::delete('{id}', [AddressController::class, 'destroy']);
});

// Rating Routes
Route::prefix('ratings')->group(function () {
    Route::get('book/{bookId}', [RatingController::class, 'index']);
    Route::post('/', [RatingController::class, 'store']);
    Route::delete('{id}', [RatingController::class, 'destroy']);
});

// Payment Routes
Route::prefix('payments')->group(function () {
    Route::get('/', [PaymentController::class, 'index']);
    Route::get('statistics', [PaymentController::class, 'statistics']);
    Route::get('{id}', [PaymentController::class, 'show']);
    Route::post('/', [PaymentController::class, 'store']);
    Route::put('{id}/status', [PaymentController::class, 'updateStatus']);
    Route::put('{id}', [PaymentController::class, 'update']);
    Route::delete('{id}', [PaymentController::class, 'destroy']);
});

// User Routes (Admin only)
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('statistics', [UserController::class, 'statistics']);
    Route::get('{id}', [UserController::class, 'show']);
    Route::post('/', [UserController::class, 'store']);
    Route::put('{id}', [UserController::class, 'update']);
    Route::put('{id}/role', [UserController::class, 'updateRole']);
    Route::delete('{id}', [UserController::class, 'destroy']);
});
