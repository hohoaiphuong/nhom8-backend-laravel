<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class CheckApiToken
{
    public function handle(Request $request, Closure $next)
    {
        // Get token from Authorization header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Unauthorized - Token required'
            ], 401);
        }

        // Check if user with this token exists
        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized - Invalid token'
            ], 401);
        }

        // Set authenticated user for this request
        auth('api')->setUser($user);

        return $next($request);
    }
}
