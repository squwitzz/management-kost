<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FoodItemController extends Controller
{
    /**
     * Get all food items
     */
    public function index()
    {
        $foodItems = FoodItem::all();
        return response()->json(['food_items' => $foodItems]);
    }

    /**
     * Get food item by ID
     */
    public function show($id)
    {
        $foodItem = FoodItem::findOrFail($id);
        return response()->json(['food_item' => $foodItem]);
    }

    /**
     * Create new food item (Admin only)
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_makanan' => 'required|string|max:255',
            'nama_vendor' => 'required|string|max:255',
            'harga' => 'required|integer|min:0',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'deskripsi' => 'nullable|string',
            'status_stok' => 'nullable|in:Tersedia,Habis',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('gambar');

        // Upload gambar if exists
        if ($request->hasFile('gambar')) {
            $file = $request->file('gambar');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('food_images', $filename, 'public');
            $data['gambar'] = $path;
        }

        $foodItem = FoodItem::create($data);

        return response()->json([
            'message' => 'Menu makanan berhasil ditambahkan',
            'food_item' => $foodItem
        ], 201);
    }

    /**
     * Update food item (Admin only)
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_makanan' => 'sometimes|string|max:255',
            'nama_vendor' => 'sometimes|string|max:255',
            'harga' => 'sometimes|integer|min:0',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'deskripsi' => 'nullable|string',
            'status_stok' => 'sometimes|in:Tersedia,Habis',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $foodItem = FoodItem::findOrFail($id);
        $data = $request->except('gambar');

        // Upload new gambar if exists
        if ($request->hasFile('gambar')) {
            // Delete old image
            if ($foodItem->gambar) {
                Storage::disk('public')->delete($foodItem->gambar);
            }

            $file = $request->file('gambar');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('food_images', $filename, 'public');
            $data['gambar'] = $path;
        }

        $foodItem->update($data);

        return response()->json([
            'message' => 'Menu makanan berhasil diupdate',
            'food_item' => $foodItem
        ]);
    }

    /**
     * Delete food item (Admin only)
     */
    public function destroy($id)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $foodItem = FoodItem::findOrFail($id);

        // Delete image if exists
        if ($foodItem->gambar) {
            Storage::disk('public')->delete($foodItem->gambar);
        }

        $foodItem->delete();

        return response()->json(['message' => 'Menu makanan berhasil dihapus']);
    }
}
