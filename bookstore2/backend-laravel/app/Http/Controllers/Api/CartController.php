<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show($userId)
    {
        $cart = Cart::where('nguoi_dung_id', $userId)->with('cartItems.sach')->first();

        if (!$cart) {
            $cart = Cart::create(['nguoi_dung_id' => $userId]);
            $cartItems = [];
        } else {
            $cartItems = $cart->cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'gio_hang_id' => $item->gio_hang_id,
                    'sach_id' => $item->sach_id,
                    'so_luong' => $item->so_luong,
                    'sach' => $item->sach,
                ];
            });
        }

        return response()->json([
            'message' => 'Cart retrieved successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'chi_tiet_gio_hang' => $cartItems,
            ]
        ], 200);
    }

    public function addItem(Request $request, $userId)
    {
        $validated = $request->validate([
            'sach_id' => 'required|exists:sach,id',
            'so_luong' => 'required|integer|min:1'
        ]);

        $cart = Cart::firstOrCreate(['nguoi_dung_id' => $userId]);

        $cartItem = CartItem::where('gio_hang_id', $cart->id)
                            ->where('sach_id', $validated['sach_id'])
                            ->first();

        if ($cartItem) {
            $cartItem->update(['so_luong' => $cartItem->so_luong + $validated['so_luong']]);
        } else {
            CartItem::create([
                'gio_hang_id' => $cart->id,
                'sach_id' => $validated['sach_id'],
                'so_luong' => $validated['so_luong']
            ]);
        }

        $cart = $cart->load('cartItems.sach');
        $cartItems = $cart->cartItems->map(function ($item) {
            return [
                'id' => $item->id,
                'gio_hang_id' => $item->gio_hang_id,
                'sach_id' => $item->sach_id,
                'so_luong' => $item->so_luong,
                'sach' => $item->sach,
            ];
        });

        return response()->json([
            'message' => 'Item added to cart successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'chi_tiet_gio_hang' => $cartItems,
            ]
        ], 200);
    }

    public function updateItem(Request $request, $userId, $itemId)
    {
        $validated = $request->validate([
            'so_luong' => 'required|integer|min:1'
        ]);

        $cart = Cart::where('nguoi_dung_id', $userId)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::where('id', $itemId)
                            ->where('gio_hang_id', $cart->id)
                            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        $cartItem->update($validated);

        $cart = $cart->load('cartItems.sach');
        $cartItems = $cart->cartItems->map(function ($item) {
            return [
                'id' => $item->id,
                'gio_hang_id' => $item->gio_hang_id,
                'sach_id' => $item->sach_id,
                'so_luong' => $item->so_luong,
                'sach' => $item->sach,
            ];
        });

        return response()->json([
            'message' => 'Cart item updated successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'chi_tiet_gio_hang' => $cartItems,
            ]
        ], 200);
    }

    public function removeItem($userId, $itemId)
    {
        $cart = Cart::where('nguoi_dung_id', $userId)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        CartItem::where('id', $itemId)
                ->where('gio_hang_id', $cart->id)
                ->delete();

        $cart = $cart->load('cartItems.sach');
        $cartItems = $cart->cartItems->map(function ($item) {
            return [
                'id' => $item->id,
                'gio_hang_id' => $item->gio_hang_id,
                'sach_id' => $item->sach_id,
                'so_luong' => $item->so_luong,
                'sach' => $item->sach,
            ];
        });

        return response()->json([
            'message' => 'Item removed from cart successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'chi_tiet_gio_hang' => $cartItems,
            ]
        ], 200);
    }

    public function clear($userId)
    {
        $cart = Cart::where('nguoi_dung_id', $userId)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        CartItem::where('gio_hang_id', $cart->id)->delete();

        return response()->json([
            'message' => 'Cart cleared successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'chi_tiet_gio_hang' => [],
            ]
        ], 200);
    }

    // Admin methods
    public function index()
    {
        $carts = Cart::with(['cartItems.sach', 'user'])->get();

        $carts = $carts->map(function ($cart) {
            $totalItems = $cart->cartItems->sum('so_luong');
            $totalValue = $cart->cartItems->sum(function ($item) {
                return ($item->sach->gia ?? 0) * ($item->so_luong ?? 0);
            });

            return [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'user' => $cart->user,
                'chi_tiet_gio_hang' => $cart->cartItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'gio_hang_id' => $item->gio_hang_id,
                        'sach_id' => $item->sach_id,
                        'so_luong' => $item->so_luong,
                        'sach' => $item->sach,
                    ];
                }),
                'totalItems' => $totalItems,
                'totalValue' => $totalValue,
                'created_at' => $cart->created_at,
            ];
        });

        return response()->json([
            'message' => 'Carts retrieved successfully',
            'data' => $carts
        ], 200);
    }

    public function showCart($cartId)
    {
        $cart = Cart::with(['cartItems.sach', 'user'])->find($cartId);

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $totalItems = $cart->cartItems->sum('so_luong');
        $totalValue = $cart->cartItems->sum(function ($item) {
            return ($item->sach->gia ?? 0) * ($item->so_luong ?? 0);
        });

        return response()->json([
            'message' => 'Cart retrieved successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'user' => $cart->user,
                'chi_tiet_gio_hang' => $cart->cartItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'gio_hang_id' => $item->gio_hang_id,
                        'sach_id' => $item->sach_id,
                        'so_luong' => $item->so_luong,
                        'sach' => $item->sach,
                    ];
                }),
                'totalItems' => $totalItems,
                'totalValue' => $totalValue,
            ]
        ], 200);
    }

    public function removeItemAdmin($cartId, $itemId)
    {
        $cart = Cart::with(['cartItems.sach', 'user'])->find($cartId);

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        CartItem::where('id', $itemId)
                ->where('gio_hang_id', $cartId)
                ->delete();

        $totalItems = $cart->cartItems->sum('so_luong');
        $totalValue = $cart->cartItems->sum(function ($item) {
            return ($item->sach->gia ?? 0) * ($item->so_luong ?? 0);
        });

        return response()->json([
            'message' => 'Item removed from cart successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'user' => $cart->user,
                'chi_tiet_gio_hang' => $cart->cartItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'gio_hang_id' => $item->gio_hang_id,
                        'sach_id' => $item->sach_id,
                        'so_luong' => $item->so_luong,
                        'sach' => $item->sach,
                    ];
                }),
                'totalItems' => $totalItems,
                'totalValue' => $totalValue,
            ]
        ], 200);
    }

    public function updateItemAdmin(Request $request, $cartId, $itemId)
    {
        $validated = $request->validate([
            'so_luong' => 'required|integer|min:1'
        ]);

        $cart = Cart::with(['cartItems.sach', 'user'])->find($cartId);

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::where('id', $itemId)
                            ->where('gio_hang_id', $cartId)
                            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        $cartItem->update($validated);

        $totalItems = $cart->cartItems->sum('so_luong');
        $totalValue = $cart->cartItems->sum(function ($item) {
            return ($item->sach->gia ?? 0) * ($item->so_luong ?? 0);
        });

        return response()->json([
            'message' => 'Cart item updated successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'user' => $cart->user,
                'chi_tiet_gio_hang' => $cart->cartItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'gio_hang_id' => $item->gio_hang_id,
                        'sach_id' => $item->sach_id,
                        'so_luong' => $item->so_luong,
                        'sach' => $item->sach,
                    ];
                }),
                'totalItems' => $totalItems,
                'totalValue' => $totalValue,
            ]
        ], 200);
    }

    public function clearAdmin($cartId)
    {
        $cart = Cart::with(['cartItems.sach', 'user'])->find($cartId);

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        CartItem::where('gio_hang_id', $cartId)->delete();

        return response()->json([
            'message' => 'Cart cleared successfully',
            'data' => [
                'id' => $cart->id,
                'nguoi_dung_id' => $cart->nguoi_dung_id,
                'user' => $cart->user,
                'chi_tiet_gio_hang' => [],
                'totalItems' => 0,
                'totalValue' => 0,
            ]
        ], 200);
    }
}
