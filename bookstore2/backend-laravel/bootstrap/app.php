<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\EnableCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Apply CORS middleware globally to allow cross-origin requests
        $middleware->use([
            EnableCors::class,
        ]);
        
        $middleware->alias([
            'cors' => EnableCors::class,
            'auth.token' => \App\Http\Middleware\CheckApiToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Custom JSON response for validation errors
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        });
    })->create();
