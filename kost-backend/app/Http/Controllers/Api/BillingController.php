<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillingSetting;
use App\Models\Payment;
use App\Models\PaymentAdditionalCharge;
use App\Models\User;
use App\Models\Room;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;
use App\Http\Controllers\Api\PushNotificationController;

class BillingController extends Controller
{
    /**
     * Get billing settings
     */
    public function getSettings(Request $request)
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

        $settings = BillingSetting::getSettings();
        return response()->json(['settings' => $settings]);
    }

    /**
     * Update billing settings
     */
    public function updateSettings(Request $request)
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
            'billing_cycle_days' => 'sometimes|integer|min:1',
            'due_date_day' => 'sometimes|integer|min:1|max:31',
            'late_fee_percentage' => 'sometimes|nullable|numeric|min:0',
            'late_fee_amount' => 'sometimes|nullable|numeric|min:0',
            'grace_period_days' => 'sometimes|integer|min:0',
            'auto_generate' => 'sometimes|boolean',
            'auto_generate_day' => 'sometimes|integer|min:1|max:31',
            'enable_late_fee' => 'sometimes|boolean',
            'late_fee_type' => 'sometimes|in:percentage,fixed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = BillingSetting::getSettings();
        $settings->update($request->all());

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings
        ]);
    }

    /**
     * Preview payments before generating
     */
    public function previewPayments(Request $request)
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
            'periode' => 'required|string', // Format: "2026-01" or "Januari 2026"
            'room_ids' => 'sometimes|array',
            'room_ids.*' => 'exists:rooms,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = BillingSetting::getSettings();
        $periode = $request->periode;
        
        // Calculate due date
        $dueDate = $this->calculateDueDate($periode, $settings->due_date_day);

        // Get residents to bill
        if ($request->has('room_ids')) {
            $residents = User::whereIn('room_id', $request->room_ids)
                ->where('role', 'Penghuni')
                ->with('room')
                ->get();
        } else {
            $residents = User::whereNotNull('room_id')
                ->where('role', 'Penghuni')
                ->with('room')
                ->get();
        }

        $preview = [];
        $totalAmount = 0;

        foreach ($residents as $resident) {
            if ($resident->room) {
                $amount = $resident->room->tarif_dasar;
                $preview[] = [
                    'user_id' => $resident->id,
                    'user_name' => $resident->nama,
                    'room_number' => $resident->room->nomor_kamar,
                    'tarif_dasar' => $amount,
                    'jumlah_tagihan' => $amount,
                ];
                $totalAmount += $amount;
            }
        }

        return response()->json([
            'preview' => $preview,
            'total_amount' => $totalAmount,
            'total_residents' => count($preview),
            'periode' => $periode,
            'due_date' => $dueDate->format('Y-m-d'),
        ]);
    }

    /**
     * Generate payments
     */
    public function generatePayments(Request $request)
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
            'periode' => 'required|string',
            'room_ids' => 'sometimes|array',
            'room_ids.*' => 'exists:rooms,id',
            'due_date' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = BillingSetting::getSettings();
        $periode = $request->periode;
        $dueDate = $request->has('due_date') 
            ? Carbon::parse($request->due_date)
            : $this->calculateDueDate($periode, $settings->due_date_day);

        // Get residents to bill
        if ($request->has('room_ids')) {
            $residents = User::whereIn('room_id', $request->room_ids)
                ->where('role', 'Penghuni')
                ->with('room')
                ->get();
        } else {
            $residents = User::whereNotNull('room_id')
                ->where('role', 'Penghuni')
                ->with('room')
                ->get();
        }

        $generated = [];

        foreach ($residents as $resident) {
            if ($resident->room) {
                // Check if payment already exists for this period
                $existingPayment = Payment::where('user_id', $resident->id)
                    ->where('bulan_dibayar', $periode)
                    ->first();

                if ($existingPayment) {
                    continue; // Skip if already exists
                }

                $payment = Payment::create([
                    'user_id' => $resident->id,
                    'tarif_dasar' => $resident->room->tarif_dasar,
                    'total_additional_charges' => 0,
                    'total_discount' => 0,
                    'jumlah_tagihan' => $resident->room->tarif_dasar,
                    'status_bayar' => 'Belum Lunas',
                    'bulan_dibayar' => $periode,
                    'due_date' => $dueDate,
                    'is_finalized' => false,
                ]);

                $generated[] = $payment;
            }
        }

        return response()->json([
            'message' => 'Payments generated successfully',
            'generated_count' => count($generated),
            'payments' => $generated,
        ], 201);
    }

    /**
     * Get draft payments (not finalized)
     */
    public function getDraftPayments(Request $request)
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

        $drafts = Payment::where('is_finalized', false)
            ->with(['user.room', 'additionalCharges'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['drafts' => $drafts]);
    }

    /**
     * Update payment charges
     */
    public function updatePaymentCharges(Request $request, $id)
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

        $payment = Payment::findOrFail($id);

        if ($payment->is_finalized) {
            return response()->json(['error' => 'Cannot edit finalized payment'], 400);
        }

        $validator = Validator::make($request->all(), [
            'additional_charges' => 'sometimes|array',
            'additional_charges.*.type' => 'required|in:electricity,water,maintenance,late_fee,other',
            'additional_charges.*.amount' => 'required|numeric',
            'additional_charges.*.description' => 'nullable|string',
            'discount' => 'sometimes|numeric|min:0',
            'notes' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Delete existing additional charges
        $payment->additionalCharges()->delete();

        // Add new additional charges
        $totalAdditional = 0;
        if ($request->has('additional_charges')) {
            foreach ($request->additional_charges as $charge) {
                PaymentAdditionalCharge::create([
                    'payment_id' => $payment->id,
                    'charge_type' => $charge['type'],
                    'amount' => $charge['amount'],
                    'description' => $charge['description'] ?? null,
                ]);
                $totalAdditional += $charge['amount'];
            }
        }

        // Update payment
        $payment->total_additional_charges = $totalAdditional;
        $payment->total_discount = $request->discount ?? 0;
        $payment->notes = $request->notes ?? null;
        $payment->calculateTotal();

        return response()->json([
            'message' => 'Payment updated successfully',
            'payment' => $payment->load('additionalCharges'),
        ]);
    }

    /**
     * Finalize payment (send to resident)
     */
    public function finalizePayment(Request $request, $id)
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

        $payment = Payment::findOrFail($id);

        if ($payment->is_finalized) {
            return response()->json(['error' => 'Payment already finalized'], 400);
        }

        $payment->is_finalized = true;
        $payment->finalized_at = now();
        $payment->save();

        // Send notification to resident
        Notification::create([
            'user_id' => $payment->user_id,
            'judul' => 'Tagihan Baru',
            'pesan' => "Tagihan untuk periode {$payment->bulan_dibayar} sebesar Rp " . number_format($payment->jumlah_tagihan, 0, ',', '.') . " telah diterbitkan. Jatuh tempo: " . $payment->due_date->format('d M Y'),
            'tipe' => 'Tagihan',
        ]);

        // Send push notification
        PushNotificationController::sendPushNotification(
            $payment->user_id,
            'Tagihan Baru',
            "Tagihan untuk periode {$payment->bulan_dibayar} sebesar Rp " . number_format($payment->jumlah_tagihan, 0, ',', '.') . " telah diterbitkan. Jatuh tempo: " . $payment->due_date->format('d M Y'),
            '/payments'
        );

        return response()->json([
            'message' => 'Payment finalized successfully',
            'payment' => $payment,
        ]);
    }

    /**
     * Bulk finalize payments
     */
    public function bulkFinalizePayments(Request $request)
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
            'payment_ids' => 'required|array',
            'payment_ids.*' => 'exists:payments,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payments = Payment::whereIn('id', $request->payment_ids)
            ->where('is_finalized', false)
            ->get();

        foreach ($payments as $payment) {
            $payment->is_finalized = true;
            $payment->finalized_at = now();
            $payment->save();

            // Send notification to resident
            Notification::create([
                'user_id' => $payment->user_id,
                'judul' => 'Tagihan Baru',
                'pesan' => "Tagihan untuk periode {$payment->bulan_dibayar} sebesar Rp " . number_format($payment->jumlah_tagihan, 0, ',', '.') . " telah diterbitkan. Jatuh tempo: " . $payment->due_date->format('d M Y'),
                'tipe' => 'Tagihan',
            ]);
            
            // Send push notification
            PushNotificationController::sendPushNotification(
                $payment->user_id,
                'Tagihan Baru',
                "Tagihan untuk periode {$payment->bulan_dibayar} sebesar Rp " . number_format($payment->jumlah_tagihan, 0, ',', '.') . " telah diterbitkan. Jatuh tempo: " . $payment->due_date->format('d M Y'),
                '/payments'
            );
        }

        return response()->json([
            'message' => 'Payments finalized successfully',
            'finalized_count' => count($payments),
        ]);
    }

    /**
     * Delete draft payment
     */
    public function deleteDraftPayment(Request $request, $id)
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

        $payment = Payment::findOrFail($id);

        if ($payment->is_finalized) {
            return response()->json(['error' => 'Cannot delete finalized payment'], 400);
        }

        $payment->delete();

        return response()->json(['message' => 'Draft payment deleted successfully']);
    }

    /**
     * Calculate due date based on periode and due_date_day
     */
    private function calculateDueDate($periode, $dueDateDay)
    {
        // Parse periode (format: "2026-01" or "Januari 2026")
        if (preg_match('/^\d{4}-\d{2}$/', $periode)) {
            // Format: 2026-01
            $date = Carbon::createFromFormat('Y-m', $periode);
        } else {
            // Format: Januari 2026
            $months = [
                'Januari' => 1, 'Februari' => 2, 'Maret' => 3, 'April' => 4,
                'Mei' => 5, 'Juni' => 6, 'Juli' => 7, 'Agustus' => 8,
                'September' => 9, 'Oktober' => 10, 'November' => 11, 'Desember' => 12
            ];
            
            $parts = explode(' ', $periode);
            $month = $months[$parts[0]] ?? 1;
            $year = $parts[1] ?? date('Y');
            
            $date = Carbon::create($year, $month, 1);
        }

        // Add one month and set due date day
        $dueDate = $date->addMonth()->day((int) $dueDateDay);

        return $dueDate;
    }
}
