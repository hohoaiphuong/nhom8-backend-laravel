<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index($userId)
    {
        $addresses = Address::where('nguoi_dung_id', $userId)->get();

        return response()->json([
            'message' => 'Addresses retrieved successfully',
            'data' => $addresses
        ], 200);
    }

    public function show($id)
    {
        $address = Address::find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        return response()->json($address, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'dia_chi' => 'required|string',
            'mac_dinh' => 'sometimes|boolean'
        ]);

        if ($validated['mac_dinh'] ?? false) {
            Address::where('nguoi_dung_id', $validated['nguoi_dung_id'])
                   ->update(['mac_dinh' => 0]);
        }

        $address = Address::create($validated);

        return response()->json([
            'message' => 'Address created successfully',
            'data' => $address
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $address = Address::find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        $validated = $request->validate([
            'dia_chi' => 'sometimes|string',
            'mac_dinh' => 'sometimes|boolean'
        ]);

        if ($validated['mac_dinh'] ?? false) {
            Address::where('nguoi_dung_id', $address->nguoi_dung_id)
                   ->where('id', '!=', $id)
                   ->update(['mac_dinh' => 0]);
        }

        $address->update($validated);

        return response()->json([
            'message' => 'Address updated successfully',
            'data' => $address
        ], 200);
    }

    public function destroy($id)
    {
        $address = Address::find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully'], 200);
    }
}
