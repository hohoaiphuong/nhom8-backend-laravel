<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function index($bookId)
    {
        $ratings = Rating::where('sach_id', $bookId)
                         ->with('user')
                         ->get();

        return response()->json([
            'message' => 'Ratings retrieved successfully',
            'data' => $ratings
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'sach_id' => 'required|exists:sach,id',
            'so_sao' => 'required|integer|min:1|max:5',
            'binh_luan' => 'nullable|string'
        ]);

        $rating = Rating::create($validated);

        return response()->json([
            'message' => 'Rating created successfully',
            'data' => $rating->load('user')
        ], 201);
    }

    public function destroy($id)
    {
        $rating = Rating::find($id);

        if (!$rating) {
            return response()->json(['message' => 'Rating not found'], 404);
        }

        $rating->delete();

        return response()->json(['message' => 'Rating deleted successfully'], 200);
    }
}
