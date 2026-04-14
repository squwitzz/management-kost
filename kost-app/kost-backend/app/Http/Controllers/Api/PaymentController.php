<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\User;

class PaymentController extends Controller
{
    /**
     * Get all payments (Admin) or user's payments (Penghuni)
     */
    public function index(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['error' => 'No token provided'], 401);
            }
            
            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            $user = User::find($userId);
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }

        if ($user->isAdmin()) {
            $payments = Payment::with('user')->latest()->get();
        } else {
            $payments = Payment::where('user_id', $user->id)->latest()->get();
        }

        return response()->json(['payments' => $payments]);
    }

    /**
     * Get payment by ID
     */
    public function show(Request $request, $id)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['error' => 'No token provided'], 401);
            }
            
            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            $user = User::find($userId);
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }

        $payment = Payment::with(['user.room', 'additionalCharges'])->findOrFail($id);

        // Check authorization
        if (!$user->isAdmin() && $payment->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['payment' => $payment]);
    }

    /**
     * Upload bukti pembayaran (Penghuni)
     */
    public function uploadBukti(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['error' => 'No token provided'], 401);
            }
            
            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            $user = User::find($userId);
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }

        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|exists:payments,id',
            'bukti_bayar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::findOrFail($request->payment_id);

        // Check authorization
        if ($payment->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Upload file
        if ($request->hasFile('bukti_bayar')) {
            $file = $request->file('bukti_bayar');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('bukti_bayar', $filename, 'public');

            // Delete old file if exists
            if ($payment->bukti_bayar) {
                Storage::disk('public')->delete($payment->bukti_bayar);
            }

            $payment->update([
                'bukti_bayar' => $path,
                'status_bayar' => 'Menunggu Verifikasi',
                'tanggal_upload' => now(),
            ]);

            // Create notification for admin
            $admins = User::where('role', 'Admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'judul' => 'Bukti Pembayaran Baru',
                    'pesan' => "Penghuni {$user->nama} telah mengunggah bukti pembayaran untuk bulan {$payment->bulan_dibayar}",
                    'tipe' => 'Pembayaran',
                ]);
            }

            return response()->json([
                'message' => 'Bukti pembayaran berhasil diunggah',
                'payment' => $payment
            ]);
        }

        return response()->json(['error' => 'File tidak ditemukan'], 400);
    }

    /**
     * Verify payment (Admin only)
     */
    public function verify(Request $request, $id)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['error' => 'No token provided'], 401);
            }
            
            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            $user = User::find($userId);
            
            if (!$user || !$user->isAdmin()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }

        $validator = Validator::make($request->all(), [
            'status_bayar' => 'required|in:Lunas,Belum Lunas',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::findOrFail($id);
        $payment->update([
            'status_bayar' => $request->status_bayar,
            'tanggal_verifikasi' => now(),
        ]);

        // Create notification for penghuni
        Notification::create([
            'user_id' => $payment->user_id,
            'judul' => 'Status Pembayaran',
            'pesan' => "Pembayaran Anda untuk bulan {$payment->bulan_dibayar} telah {$request->status_bayar}",
            'tipe' => 'Pembayaran',
        ]);

        return response()->json([
            'message' => 'Status pembayaran berhasil diupdate',
            'payment' => $payment
        ]);
    }

    /**
     * Create new payment (Admin only)
     */
    public function store(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['error' => 'No token provided'], 401);
            }
            
            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            $user = User::find($userId);
            
            if (!$user || !$user->isAdmin()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'jumlah_tagihan' => 'required|integer|min:0',
            'bulan_dibayar' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::create($request->all());

        // Create notification for penghuni
        Notification::create([
            'user_id' => $request->user_id,
            'judul' => 'Tagihan Baru',
            'pesan' => "Tagihan untuk bulan {$request->bulan_dibayar} sebesar Rp " . number_format($request->jumlah_tagihan, 0, ',', '.'),
            'tipe' => 'Tagihan',
        ]);

        return response()->json([
            'message' => 'Tagihan berhasil dibuat',
            'payment' => $payment
        ], 201);
    }
}
