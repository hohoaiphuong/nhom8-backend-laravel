<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['category', 'ratings']);

        if ($request->has('category_id')) {
            $query->where('the_loai_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('ten_sach', 'like', "%$search%")
                  ->orWhere('tac_gia', 'like', "%$search%");
        }

        $books = $query->get();

        return response()->json([
            'message' => 'Books retrieved successfully',
            'data' => $books
        ], 200);
    }

    public function show($id)
    {
        $book = Book::with(['category', 'ratings'])->find($id);

        if (!$book) {
            return response()->json([
                'success' => false,
                'message' => 'Book not found',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Book retrieved successfully',
            'data' => $book
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_sach' => 'required|string|max:255',
            'tac_gia' => 'required|string|max:100',
            'gia' => 'required|numeric|min:0',
            'so_luong' => 'required|integer|min:0',
            'the_loai_id' => 'required|exists:the_loai,id',
            'hinh_anh' => 'nullable|string',
            'mo_ta' => 'nullable|string'
        ]);

        $book = Book::create($validated);

        return response()->json([
            'message' => 'Book created successfully',
            'data' => $book
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $validated = $request->validate([
            'ten_sach' => 'sometimes|string|max:255',
            'tac_gia' => 'sometimes|string|max:100',
            'gia' => 'sometimes|numeric|min:0',
            'so_luong' => 'sometimes|integer|min:0',
            'the_loai_id' => 'sometimes|exists:the_loai,id',
            'hinh_anh' => 'nullable|string',
            'mo_ta' => 'nullable|string'
        ]);

        $book->update($validated);

        return response()->json([
            'message' => 'Book updated successfully',
            'data' => $book
        ], 200);
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted successfully'], 200);
    }
}
