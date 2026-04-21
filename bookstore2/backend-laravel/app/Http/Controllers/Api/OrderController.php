<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Book;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index($userId = null)
    {
        $query = Order::with(['orderDetails.book', 'address', 'payment']);

        if ($userId) {
            $query->where('nguoi_dung_id', $userId);
        }

        $orders = $query->get();

        return response()->json([
            'message' => 'Orders retrieved successfully',
            'data' => $orders
        ], 200);
    }

    public function show($id)
    {
        $order = Order::with([
            'orderDetails' => function($query) {
                $query->with('book');
            },
            'address', 
            'user', 
            'payment'
        ])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Debug: Log order details
        \Log::info('Order Details:', $order->orderDetails->toArray());

        return response()->json($order, 200);
    }

    public function store(Request $request)
    {
        $isGuest = !$request->has('nguoi_dung_id') || !$request->get('nguoi_dung_id');

        if ($isGuest) {
            // Guest order validation
            $validated = $request->validate([
                'email' => 'required|email',
                'so_dien_thoai' => 'required|string',
                'dia_chi' => 'required|string',
                'ten_khach' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.sach_id' => 'required|integer|exists:sach,id',
                'items.*.so_luong' => 'required|integer|min:1',
                'items.*.gia' => 'required|numeric|min:0',
                'tong_tien' => 'required|numeric|min:0',
                'phuong_thuc_van_chuyen' => 'nullable|string'
            ]);
        } else {
            // Authenticated user order validation
            $validated = $request->validate([
                'nguoi_dung_id' => 'required|integer|exists:nguoi_dung,id',
                'email' => 'nullable|email',
                'so_dien_thoai' => 'nullable|string',
                'dia_chi' => 'required|string',
                'ten_khach' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.sach_id' => 'required|integer|exists:sach,id',
                'items.*.so_luong' => 'required|integer|min:1',
                'items.*.gia' => 'required|numeric|min:0',
                'phuong_thuc_van_chuyen' => 'nullable|string'
            ]);
        }

        $totalPrice = isset($validated['tong_tien']) ? $validated['tong_tien'] : 0;
        if (!$totalPrice && isset($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $totalPrice += $item['gia'] * $item['so_luong'];
            }
        }

        $orderData = [
            'tong_tien' => $totalPrice,
            'trang_thai' => 'cho_xu_ly',
            'email' => $validated['email'] ?? null,
            'so_dien_thoai' => $validated['so_dien_thoai'] ?? null,
            'dia_chi' => $validated['dia_chi'],
            'ten_khach' => $validated['ten_khach'] ?? 'Guest',
            'phuong_thuc_van_chuyen' => $validated['phuong_thuc_van_chuyen'] ?? 'standard'
        ];

        if (!$isGuest) {
            $orderData['nguoi_dung_id'] = $validated['nguoi_dung_id'];
        }

        $order = Order::create($orderData);

        foreach ($validated['items'] as $item) {
            OrderDetail::create([
                'don_hang_id' => $order->id,
                'sach_id' => $item['sach_id'],
                'so_luong' => $item['so_luong'],
                'gia' => $item['gia']
            ]);

            // Giảm số lượng sách trong kho
            Book::find($item['sach_id'])->decrement('so_luong', $item['so_luong']);
        }

        return response()->json([
            'message' => 'Order created successfully',
            'data' => $order->load('orderDetails.book')
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'trang_thai' => 'required|in:cho_xu_ly,dang_giao,hoan_thanh,da_huy'
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => $order
        ], 200);
    }

    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully'], 200);
    }
}
