<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'ten' => 'required|string|max:100',
            'email' => 'required|email|unique:nguoi_dung',
            'mat_khau' => 'required|string|min:6',
            'so_dien_thoai' => 'nullable|string|max:15'
        ]);

        $user = User::create([
            'ten' => $validated['ten'],
            'email' => $validated['email'],
            'mat_khau' => Hash::make($validated['mat_khau']),
            'so_dien_thoai' => $validated['so_dien_thoai'] ?? null,
            'vai_tro' => 'nguoi_dung',
            'api_token' => Str::random(80)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'api_token' => $user->api_token,
                'vai_tro' => $user->vai_tro
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'mat_khau' => 'required|string'
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['mat_khau'], $user->mat_khau)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Generate new token
        $user->api_token = Str::random(80);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'api_token' => $user->api_token,
                'vai_tro' => $user->vai_tro
            ]
        ], 200);
    }

    public function profile($id)
    {
        $user = User::with(['addresses', 'orders'])->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    public function updateProfile(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $validated = $request->validate([
            'ten' => 'sometimes|string|max:100',
            'so_dien_thoai' => 'sometimes|nullable|string|max:15'
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ], 200);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'No token provided'
            ], 401);
        }

        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Clear token
        $user->api_token = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }

    public function getCurrentUser(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'No token provided'
            ], 401);
        }

        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'No token provided'
            ], 401);
        }

        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $validated = $request->validate([
            'mat_khau_cu' => 'required|string',
            'mat_khau_moi' => 'required|string|min:6',
            'mat_khau_moi_confirm' => 'required|same:mat_khau_moi'
        ]);

        if (!Hash::check($validated['mat_khau_cu'], $user->mat_khau)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 401);
        }

        $user->mat_khau = Hash::make($validated['mat_khau_moi']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ], 200);
    }
}
