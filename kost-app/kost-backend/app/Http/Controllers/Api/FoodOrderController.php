<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodOrder;
use App\Models\FoodItem;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FoodOrderController extends Controller
{
    /**
     * Get all orders (Admin) or user's orders (Penghuni)
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            $orders = FoodOrder::with(['user', 'foodItem'])->latest()->get();
        } else {
            $orders = FoodOrder::with('foodItem')
                ->where('user_id', $user->id)
                ->latest()
                ->get();
        }

        return response()->json(['orders' => $orders]);
    }

    /**
     * Create new food order (Penghuni)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'food_id' => 'required|exists:food_items,id',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $foodItem = FoodItem::findOrFail($request->food_id);

        if (!$foodItem->isAvailable()) {
            return response()->json(['error' => 'Makanan tidak tersedia'], 400);
        }

        $totalHarga = $foodItem->harga * $request->jumlah;

        $order = FoodOrder::create([
            'user_id' => $user->id,
            'food_id' => $request->food_id,
            'jumlah' => $request->jumlah,
            'total_harga' => $totalHarga,
            'catatan' => $request->catatan,
            'status_pesanan' => 'Pending',
        ]);

        // Create notification for admin
        $admins = \App\Models\User::where('role', 'Admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'judul' => 'Pesanan Makanan Baru',
                'pesan' => "{$user->nama} memesan {$foodItem->nama_makanan} x{$request->jumlah}",
                'tipe' => 'Pesanan',
            ]);
        }

        return response()->json([
            'message' => 'Pesanan berhasil dibuat',
            'order' => $order->load('foodItem')
        ], 201);
    }

    /**
     * Update order status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status_pesanan' => 'required|in:Pending,Diproses Vendor,Selesai',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = FoodOrder::with('foodItem')->findOrFail($id);
        $order->update(['status_pesanan' => $request->status_pesanan]);

        // Create notification for penghuni
        $statusMessage = [
            'Pending' => 'menunggu konfirmasi',
            'Diproses Vendor' => 'sedang diproses vendor',
            'Selesai' => 'sudah siap diambil',
        ];

        Notification::create([
            'user_id' => $order->user_id,
            'judul' => 'Status Pesanan',
            'pesan' => "Pesanan {$order->foodItem->nama_makanan} Anda {$statusMessage[$request->status_pesanan]}",
            'tipe' => 'Pesanan',
        ]);

        return response()->json([
            'message' => 'Status pesanan berhasil diupdate',
            'order' => $order
        ]);
    }

    /**
     * Get order by ID
     */
    public function show($id)
    {
        $user = auth()->user();
        $order = FoodOrder::with(['user', 'foodItem'])->findOrFail($id);

        // Check authorization
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['order' => $order]);
    }
}
