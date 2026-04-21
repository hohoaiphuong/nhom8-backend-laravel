<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Lấy danh sách người dùng
    public function index(Request $request)
    {
        $query = User::with(['orders', 'addresses', 'ratings']);

        // Filter by role
        if ($request->has('vai_tro')) {
            $query->where('vai_tro', $request->vai_tro);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('ten', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
        }

        // Pagination
        $per_page = $request->get('per_page', 15);
        $users = $query->paginate($per_page);

        return response()->json([
            'message' => 'Users retrieved successfully',
            'data' => $users->items(),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage()
            ]
        ], 200);
    }

    // Lấy chi tiết người dùng
    public function show($id)
    {
        $user = User::with(['orders', 'addresses', 'ratings', 'cart'])->find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }

    // Tạo người dùng mới (Admin only)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten' => 'required|string|max:100',
            'email' => 'required|email|unique:nguoi_dung',
            'mat_khau' => 'required|string|min:6',
            'so_dien_thoai' => 'nullable|string|max:15',
            'vai_tro' => 'sometimes|in:nguoi_dung,quan_tri'
        ]);

        $user = User::create([
            'ten' => $validated['ten'],
            'email' => $validated['email'],
            'mat_khau' => Hash::make($validated['mat_khau']),
            'so_dien_thoai' => $validated['so_dien_thoai'] ?? null,
            'vai_tro' => $validated['vai_tro'] ?? 'nguoi_dung'
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    // Cập nhật người dùng
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'ten' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:nguoi_dung,email,' . $id,
            'so_dien_thoai' => 'sometimes|nullable|string|max:15',
            'vai_tro' => 'sometimes|in:nguoi_dung,quan_tri',
            'mat_khau' => 'sometimes|string|min:6'
        ]);

        // Hash password if provided
        if (isset($validated['mat_khau'])) {
            $validated['mat_khau'] = Hash::make($validated['mat_khau']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user
        ], 200);
    }

    // Xóa người dùng
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }

    // Get user statistics
    public function statistics()
    {
        $stats = [
            'total_users' => User::count(),
            'total_customers' => User::where('vai_tro', 'nguoi_dung')->count(),
            'total_admins' => User::where('vai_tro', 'quan_tri')->count(),
            'new_users_this_month' => User::whereMonth('ngay_tao', now()->month)
                                          ->whereYear('ngay_tao', now()->year)
                                          ->count(),
            'users_with_orders' => User::has('orders')->count()
        ];

        return response()->json([
            'message' => 'User statistics retrieved',
            'data' => $stats
        ], 200);
    }

    // Update user role (admin only)
    public function updateRole(Request $request, $id)
    {
        // Get current authenticated user from token
        $token = $request->bearerToken();
        $currentUser = User::where('api_token', $token)->first();

        if (!$currentUser) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Check if current user is admin/quan_tri
        if ($currentUser->vai_tro !== 'quan_tri' && $currentUser->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thay đổi vai trò người dùng'
            ], 403);
        }

        // Validate request
        $validated = $request->validate([
            'vai_tro' => 'required|in:nguoi_dung,quan_tri,admin'
        ]);

        // Find target user
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Prevent self-promotion
        if ($currentUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể thay đổi vai trò của chính mình'
            ], 400);
        }

        // Update role
        $user->vai_tro = $validated['vai_tro'];
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Vai trò người dùng đã được cập nhật',
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'vai_tro' => $user->vai_tro
            ]
        ], 200);
    }
}
