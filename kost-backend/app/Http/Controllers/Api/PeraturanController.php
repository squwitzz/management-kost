<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peraturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class PeraturanController extends Controller
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
            
            return \App\Models\User::find($userId);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get all active peraturan (for users)
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $peraturan = Peraturan::where('is_active', true)
            ->orderBy('urutan', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'peraturan' => $peraturan
        ]);
    }

    /**
     * Get all peraturan including inactive (for admin)
     */
    public function indexAll(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $peraturan = Peraturan::orderBy('urutan', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'peraturan' => $peraturan
        ]);
    }

    /**
     * Get single peraturan
     */
    public function show(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $peraturan = Peraturan::find($id);

        if (!$peraturan) {
            return response()->json(['error' => 'Peraturan not found'], 404);
        }

        return response()->json([
            'peraturan' => $peraturan
        ]);
    }

    /**
     * Create new peraturan (admin only)
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'kategori' => 'required|in:Umum,Keamanan,Kebersihan,Fasilitas,Pembayaran,Lainnya',
            'urutan' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'icon' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $peraturan = Peraturan::create([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'kategori' => $request->kategori,
            'urutan' => $request->urutan ?? 0,
            'is_active' => $request->is_active ?? true,
            'icon' => $request->icon ?? 'rule',
        ]);

        return response()->json([
            'message' => 'Peraturan created successfully',
            'peraturan' => $peraturan
        ], 201);
    }

    /**
     * Update peraturan (admin only)
     */
    public function update(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $peraturan = Peraturan::find($id);

        if (!$peraturan) {
            return response()->json(['error' => 'Peraturan not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'judul' => 'sometimes|string|max:255',
            'deskripsi' => 'sometimes|string',
            'kategori' => 'sometimes|in:Umum,Keamanan,Kebersihan,Fasilitas,Pembayaran,Lainnya',
            'urutan' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'icon' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $peraturan->update($request->only([
            'judul',
            'deskripsi',
            'kategori',
            'urutan',
            'is_active',
            'icon',
        ]));

        return response()->json([
            'message' => 'Peraturan updated successfully',
            'peraturan' => $peraturan
        ]);
    }

    /**
     * Delete peraturan (admin only)
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $peraturan = Peraturan::find($id);

        if (!$peraturan) {
            return response()->json(['error' => 'Peraturan not found'], 404);
        }

        $peraturan->delete();

        return response()->json([
            'message' => 'Peraturan deleted successfully'
        ]);
    }

    /**
     * Toggle active status (admin only)
     */
    public function toggleActive(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $peraturan = Peraturan::find($id);

        if (!$peraturan) {
            return response()->json(['error' => 'Peraturan not found'], 404);
        }

        $peraturan->is_active = !$peraturan->is_active;
        $peraturan->save();

        return response()->json([
            'message' => 'Peraturan status updated',
            'peraturan' => $peraturan
        ]);
    }
}
