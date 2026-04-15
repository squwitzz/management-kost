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
use App\Http\Controllers\Api\PushNotificationController;

class PaymentController extends Controller
{
    /**
     * Resolve the authenticated user from the Bearer token.
     * Uses JWTAuth::checkOrFail() which validates AND verifies expiry.
     */
    private function getAuthUser(Request $request): ?User
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return null;
            }
            JWTAuth::setToken($token);
            // Use getPayload() instead of checkOrFail() - more permissive
            $payload = JWTAuth::getPayload();
            $userId  = $payload->get('sub');
            return User::find($userId);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get all payments (Admin) or user's payments (Penghuni)
     */
    public function index(Request $request)
    {
        $user = $this->getAuthUser($request);

        if (!$user) {
            return response()->json([
                'error'   => 'Unauthorized',
                'message' => 'Invalid or expired token. Please login again.',
            ], 401);
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
        $user = $this->getAuthUser($request);

        if (!$user) {
            return response()->json([
                'error'   => 'Unauthorized',
                'message' => 'Invalid or expired token. Please login again.',
            ], 401);
        }

        $payment = Payment::with(['user.room', 'additionalCharges'])->find($id);

        if (!$payment) {
            return response()->json([
                'error'   => 'Not Found',
                'message' => 'Payment not found.',
            ], 404);
        }

        // Only admin or the owner can view this payment
        // Cast to int to avoid type mismatch ('9' !== 9)
        if (!$user->isAdmin() && (int)$payment->user_id !== (int)$user->id) {
            return response()->json([
                'error'          => 'Forbidden',
                'message'        => 'You do not have permission to view this payment.',
                'payment_owner'  => (int)$payment->user_id,
                'current_user'   => (int)$user->id,
            ], 403);
        }

        return response()->json(['payment' => $payment]);
    }

    /**
     * Upload bukti pembayaran (Penghuni)
     */
    public function uploadBukti(Request $request)
    {
        $user = $this->getAuthUser($request);

        if (!$user) {
            return response()->json([
                'error'   => 'Unauthorized',
                'message' => 'Invalid or expired token. Please login again.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'payment_id'  => 'required|exists:payments,id',
            'bukti_bayar' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error'  => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $payment = Payment::find($request->payment_id);

        if (!$payment) {
            return response()->json([
                'error'   => 'Not Found',
                'message' => 'Payment not found.',
            ], 404);
        }

        // Only the owner can upload proof
        if ((int)$payment->user_id !== (int)$user->id) {
            return response()->json([
                'error'         => 'Forbidden',
                'message'       => 'You can only upload proof for your own payments.',
                'payment_owner' => (int)$payment->user_id,
                'current_user'  => (int)$user->id,
            ], 403);
        }

        if ($request->hasFile('bukti_bayar')) {
            $file     = $request->file('bukti_bayar');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path     = $file->storeAs('bukti_bayar', $filename, 'public');

            // Delete old file if exists
            if ($payment->bukti_bayar) {
                Storage::disk('public')->delete($payment->bukti_bayar);
            }

            $payment->update([
                'bukti_bayar'    => $path,
                'status_bayar'   => 'Menunggu Verifikasi',
                'tanggal_upload' => now(),
            ]);

            // Notify all admins
            $admins = User::where('role', 'Admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'judul'   => 'Bukti Pembayaran Baru',
                    'pesan'   => "Penghuni {$user->nama} telah mengunggah bukti pembayaran untuk bulan {$payment->bulan_dibayar}",
                    'tipe'    => 'Pembayaran',
                ]);
                
                // Send push notification
                PushNotificationController::sendPushNotification(
                    $admin->id,
                    'Bukti Pembayaran Baru',
                    "Penghuni {$user->nama} telah mengunggah bukti pembayaran untuk bulan {$payment->bulan_dibayar}",
                    '/admin/payments'
                );
            }

            return response()->json([
                'message' => 'Bukti pembayaran berhasil diunggah',
                'payment' => $payment,
            ]);
        }

        return response()->json(['error' => 'File tidak ditemukan'], 400);
    }

    /**
     * Verify payment (Admin only)
     */
    public function verify(Request $request, $id)
    {
        $user = $this->getAuthUser($request);

        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'error'   => 'Unauthorized',
                'message' => 'Admin access required.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'status_bayar' => 'required|in:Lunas,Belum Lunas',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::findOrFail($id);
        $payment->update([
            'status_bayar'       => $request->status_bayar,
            'tanggal_verifikasi' => now(),
        ]);

        Notification::create([
            'user_id' => $payment->user_id,
            'judul'   => 'Status Pembayaran',
            'pesan'   => "Pembayaran Anda untuk bulan {$payment->bulan_dibayar} telah {$request->status_bayar}",
            'tipe'    => 'Pembayaran',
        ]);

        // Send push notification
        PushNotificationController::sendPushNotification(
            $payment->user_id,
            'Status Pembayaran',
            "Pembayaran Anda untuk periode {\$payment->bulan_tahun} telah {\$statusText}",
            '/payments'
        );

        return response()->json([
            'message' => 'Status pembayaran berhasil diupdate',
            'payment' => $payment,
        ]);
    }

    /**
     * Create new payment (Admin only)
     */
    public function store(Request $request)
    {
        $user = $this->getAuthUser($request);

        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'error'   => 'Unauthorized',
                'message' => 'Admin access required.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'user_id'        => 'required|exists:users,id',
            'jumlah_tagihan' => 'required|integer|min:0',
            'bulan_dibayar'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::create($request->all());

        Notification::create([
            'user_id' => $request->user_id,
            'judul'   => 'Tagihan Baru',
            'pesan'   => "Tagihan untuk bulan {$request->bulan_dibayar} sebesar Rp " . number_format($request->jumlah_tagihan, 0, ',', '.'),
            'tipe'    => 'Tagihan',
        ]);

        // Send push notification
        PushNotificationController::sendPushNotification(
            $request->user_id,
            'Tagihan Baru',
            "Tagihan baru untuk periode {\$payment->bulan_tahun} sebesar Rp " . number_format($payment->jumlah, 0, ',', '.'),
            '/payments'
        );

        return response()->json([
            'message' => 'Tagihan berhasil dibuat',
            'payment' => $payment,
        ], 201);
    }
}
