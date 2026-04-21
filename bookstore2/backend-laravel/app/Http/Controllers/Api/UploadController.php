<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    /**
     * Upload book image
     */
    public function uploadBookImage(Request $request)
    {
        try {
            // Debug: log incoming request
            Log::debug('Upload request received', [
                'has_image' => $request->hasFile('image'),
                'files' => $request->allFiles(),
            ]);

            $validated = $request->validate([
                'image' => 'required|file|image|max:5120' // 5MB in KB, max can work with file too
            ], [
                'image.required' => 'Vui lòng chọn ảnh',
                'image.image' => 'File phải là ảnh hợp lệ',
                'image.max' => 'Ảnh không vượt quá 5MB',
            ]);

            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Store in public/storage/books
            $path = Storage::disk('public')->putFileAs('books', $file, $filename);
            
            // Get full URL with current request host (includes port)
            $url = $request->getSchemeAndHttpHost() . '/storage/' . str_replace('\\', '/', $path);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'data' => [
                    'filename' => $filename,
                    'path' => $path,
                    'url' => $url
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Image upload failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Upload error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Image upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete book image
     */
    public function deleteBookImage(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        try {
            if (Storage::disk('public')->exists($request->path)) {
                Storage::disk('public')->delete($request->path);
            }

            return response()->json([
                'message' => 'Image deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Image deletion failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
