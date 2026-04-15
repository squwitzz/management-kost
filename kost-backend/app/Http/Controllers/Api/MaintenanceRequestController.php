<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Api\PushNotificationController;

class MaintenanceRequestController extends Controller
{
    /**
     * Get authenticated user from JWT token
     */
    private function getAuthenticatedUser(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return null;
            }

            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            
            return User::find($userId);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get all maintenance requests
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $query = MaintenanceRequest::with('user.room');

        // If Penghuni, only show their requests
        if ($user->role === 'Penghuni') {
            $query->where('user_id', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('prioritas')) {
            $query->where('prioritas', $request->prioritas);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kategori', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('nama', 'like', "%{$search}%");
                  });
            });
        }

        // Exclude drafts for admin
        if ($user->role === 'Admin') {
            $query->where('is_draft', false);
        }

        $requests = $query->latest()->get();

        return response()->json(['requests' => $requests]);
    }

    /**
     * Get user's draft requests
     */
    public function getDrafts(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $drafts = MaintenanceRequest::where('user_id', $user->id)
            ->where('is_draft', true)
            ->latest()
            ->get();

        return response()->json(['drafts' => $drafts]);
    }

    /**
     * Get single maintenance request
     */
    public function show(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $maintenanceRequest = MaintenanceRequest::with('user.room')->findOrFail($id);

        // Check authorization
        if ($user->role === 'Penghuni' && $maintenanceRequest->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json(['request' => $maintenanceRequest]);
    }

    /**
     * Create new maintenance request
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'kategori' => 'required|in:Plumbing,Electrical,Furniture,HVAC,Appliances',
            'deskripsi' => 'required|string',
            'foto' => 'nullable|image|max:10240', // 10MB
            'is_draft' => 'boolean',
        ]);

        $validated['user_id'] = $user->id;
        $validated['is_draft'] = $request->is_draft ?? false;

        // Handle photo upload
        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('maintenance_photos', 'public');
            $validated['foto'] = $path;
        }

        $maintenanceRequest = MaintenanceRequest::create($validated);

        // Create notification for admin if not draft
        if (!$validated['is_draft']) {
            $admins = User::where('role', 'Admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'judul' => 'Laporan Baru',
                    'pesan' => "{$user->nama} melaporkan masalah {$validated['kategori']}",
                    'tipe' => 'Sistem',
                ]);
                
                // Send push notification
                PushNotificationController::sendPushNotification(
                    $admin->id,
                    'Laporan Baru',
                    "{$user->nama} melaporkan masalah {$validated['kategori']}",
                    '/admin/requests'
                );
            }
        }

        return response()->json([
            'message' => $validated['is_draft'] ? 'Draft berhasil disimpan' : 'Laporan berhasil dikirim',
            'request' => $maintenanceRequest->load('user.room')
        ], 201);
    }

    /**
     * Update maintenance request
     */
    public function update(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $maintenanceRequest = MaintenanceRequest::findOrFail($id);

        // Check authorization
        if ($user->role === 'Penghuni' && $maintenanceRequest->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'kategori' => 'sometimes|in:Plumbing,Electrical,Furniture,HVAC,Appliances',
            'deskripsi' => 'sometimes|string',
            'foto' => 'nullable|image|max:10240',
            'prioritas' => 'sometimes|in:Low,Medium,High,Critical',
            'status' => 'sometimes|in:New,In Progress,Resolved',
            'catatan_admin' => 'nullable|string',
            'is_draft' => 'boolean',
        ]);

        // Handle photo upload
        if ($request->hasFile('foto')) {
            // Delete old photo
            if ($maintenanceRequest->foto) {
                Storage::disk('public')->delete($maintenanceRequest->foto);
            }
            $path = $request->file('foto')->store('maintenance_photos', 'public');
            $validated['foto'] = $path;
        }

        // Set resolved_at if status changed to Resolved
        if (isset($validated['status']) && $validated['status'] === 'Resolved' && $maintenanceRequest->status !== 'Resolved') {
            $validated['resolved_at'] = now();
            
            // Notify user
            Notification::create([
                'user_id' => $maintenanceRequest->user_id,
                'judul' => 'Laporan Selesai',
                'pesan' => "Laporan {$maintenanceRequest->kategori} Anda telah diselesaikan",
                'tipe' => 'Sistem',
            ]);
            
            // Send push notification
            PushNotificationController::sendPushNotification(
                $maintenanceRequest->user_id,
                'Laporan Selesai',
                "Laporan {$maintenanceRequest->kategori} Anda telah diselesaikan",
                '/requests'
            );
        }

        $maintenanceRequest->update($validated);

        return response()->json([
            'message' => 'Laporan berhasil diupdate',
            'request' => $maintenanceRequest->load('user.room')
        ]);
    }

    /**
     * Delete maintenance request
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $maintenanceRequest = MaintenanceRequest::findOrFail($id);

        // Check authorization
        if ($user->role === 'Penghuni' && $maintenanceRequest->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Delete photo if exists
        if ($maintenanceRequest->foto) {
            Storage::disk('public')->delete($maintenanceRequest->foto);
        }

        $maintenanceRequest->delete();

        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }

    /**
     * Get statistics
     */
    public function getStats(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'Admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $stats = [
            'total' => MaintenanceRequest::where('is_draft', false)->count(),
            'new' => MaintenanceRequest::where('status', 'New')->where('is_draft', false)->count(),
            'in_progress' => MaintenanceRequest::where('status', 'In Progress')->where('is_draft', false)->count(),
            'resolved' => MaintenanceRequest::where('status', 'Resolved')->where('is_draft', false)->count(),
            'high_priority' => MaintenanceRequest::whereIn('prioritas', ['High', 'Critical'])->where('is_draft', false)->count(),
        ];

        return response()->json(['stats' => $stats]);
    }
}
