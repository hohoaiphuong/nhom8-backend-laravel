<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    /**
     * Get all payments with optional filtering and pagination
     */
    public function index(Request $request)
    {
        $query = Payment::with('order.user');
        
        // Filter by status
        if ($request->has('trang_thai') && $request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }
        
        // Filter by payment method
        if ($request->has('phuong_thuc') && $request->phuong_thuc) {
            $query->where('phuong_thuc', $request->phuong_thuc);
        }
        
        // Search by order ID
        if ($request->has('search') && $request->search) {
            $query->whereHas('order', function ($q) use ($request) {
                $q->where('id', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($subQ) use ($request) {
                      $subQ->where('ten', 'like', '%' . $request->search . '%');
                  });
            });
        }
        
        // Pagination
        $perPage = $request->input('per_page', 15);
        $payments = $query->paginate($perPage);
        
        // Map response with explicit field names
        $mappedPayments = $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'don_hang_id' => $payment->don_hang_id,
                'phuong_thuc' => $payment->phuong_thuc,
                'trang_thai' => $payment->trang_thai,
                'order' => $payment->order ? [
                    'id' => $payment->order->id,
                    'ten' => $payment->order->user->ten ?? 'Unknown',
                    'tong_tien' => $payment->order->tong_tien,
                    'ngay_tao' => $payment->order->ngay_tao
                ] : null
            ];
        });
        
        return response()->json([
            'message' => 'Payments retrieved successfully',
            'data' => $mappedPayments,
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
                'last_page' => $payments->lastPage()
            ]
        ]);
    }

    /**
     * Get a specific payment
     */
    public function show($id)
    {
        $payment = Payment::with('order.user', 'order.chi_tiet_don_hang.sach')
            ->find($id);
        
        if (!$payment) {
            return response()->json([
                'message' => 'Payment not found'
            ], 404);
        }
        
        return response()->json([
            'message' => 'Payment retrieved successfully',
            'data' => [
                'id' => $payment->id,
                'don_hang_id' => $payment->don_hang_id,
                'phuong_thuc' => $payment->phuong_thuc,
                'trang_thai' => $payment->trang_thai,
                'order' => $payment->order ? [
                    'id' => $payment->order->id,
                    'ten_khach' => $payment->order->user->ten ?? 'Unknown',
                    'so_dien_thoai' => $payment->order->user->so_dien_thoai ?? null,
                    'dia_chi' => $payment->order->user->dia_chi ?? null,
                    'tong_tien' => $payment->order->tong_tien,
                    'trang_thai' => $payment->order->trang_thai,
                    'ngay_tao' => $payment->order->ngay_tao,
                    'chi_tiet_don_hang' => $payment->order->chi_tiet_don_hang->map(function ($detail) {
                        return [
                            'id' => $detail->id,
                            'sach_id' => $detail->sach_id,
                            'so_luong' => $detail->so_luong,
                            'gia' => $detail->gia,
                            'sach' => $detail->sach ? [
                                'id' => $detail->sach->id,
                                'ten_sach' => $detail->sach->ten_sach
                            ] : null
                        ];
                    })
                ] : null
            ]
        ]);
    }

    /**
     * Create a new payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'don_hang_id' => 'required|exists:don_hang,id',
            'phuong_thuc' => 'required|string|in:tien_mat,chuyen_khoan,vi_dien_tu',
            'trang_thai' => 'required|string|in:cho_xu_ly,da_thanh_toan'
        ]);
        
        $payment = Payment::create($validated);
        
        return response()->json([
            'message' => 'Payment created successfully',
            'data' => [
                'id' => $payment->id,
                'don_hang_id' => $payment->don_hang_id,
                'phuong_thuc' => $payment->phuong_thuc,
                'trang_thai' => $payment->trang_thai
            ]
        ], 201);
    }

    /**
     * Update payment status
     */
    public function updateStatus(Request $request, $id)
    {
        $payment = Payment::find($id);
        
        if (!$payment) {
            return response()->json([
                'message' => 'Payment not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'trang_thai' => 'required|string|in:cho_xu_ly,da_thanh_toan'
        ]);
        
        $payment->update($validated);
        
        return response()->json([
            'message' => 'Payment status updated successfully',
            'data' => [
                'id' => $payment->id,
                'don_hang_id' => $payment->don_hang_id,
                'phuong_thuc' => $payment->phuong_thuc,
                'trang_thai' => $payment->trang_thai
            ]
        ]);
    }

    /**
     * Update payment (full update)
     */
    public function update(Request $request, $id)
    {
        $payment = Payment::find($id);
        
        if (!$payment) {
            return response()->json([
                'message' => 'Payment not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'phuong_thuc' => 'sometimes|string|in:tien_mat,chuyen_khoan,vi_dien_tu',
            'trang_thai' => 'sometimes|string|in:cho_xu_ly,da_thanh_toan'
        ]);
        
        $payment->update($validated);
        
        return response()->json([
            'message' => 'Payment updated successfully',
            'data' => [
                'id' => $payment->id,
                'don_hang_id' => $payment->don_hang_id,
                'phuong_thuc' => $payment->phuong_thuc,
                'trang_thai' => $payment->trang_thai
            ]
        ]);
    }

    /**
     * Delete a payment
     */
    public function destroy($id)
    {
        $payment = Payment::find($id);
        
        if (!$payment) {
            return response()->json([
                'message' => 'Payment not found'
            ], 404);
        }
        
        $payment->delete();
        
        return response()->json([
            'message' => 'Payment deleted successfully'
        ]);
    }

    /**
     * Get payment statistics
     */
    public function statistics()
    {
        $totalPayments = Payment::count();
        $paidPayments = Payment::where('trang_thai', 'da_thanh_toan')->count();
        $pendingPayments = Payment::where('trang_thai', 'cho_xu_ly')->count();
        
        // Total revenue from paid payments
        $totalRevenue = Payment::where('trang_thai', 'da_thanh_toan')
            ->with('order')
            ->get()
            ->sum(function ($payment) {
                return $payment->order->tong_tien ?? 0;
            });
        
        // Payment methods breakdown
        $paymentMethods = Payment::selectRaw('phuong_thuc, count(*) as count')
            ->groupBy('phuong_thuc')
            ->get();
        
        return response()->json([
            'message' => 'Payment statistics retrieved successfully',
            'data' => [
                'total_payments' => $totalPayments,
                'paid_count' => $paidPayments,
                'pending_count' => $pendingPayments,
                'total_revenue' => $totalRevenue,
                'payment_methods' => $paymentMethods
            ]
        ]);
    }
}
