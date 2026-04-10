<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class RoomController extends Controller
{
    /**
     * Get all rooms (Admin only)
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
            
            if (!$user || !$user->isAdmin()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }

        $rooms = Room::with('users')->get();
        return response()->json(['rooms' => $rooms]);
    }

    /**
     * Create new room (Admin only)
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
            'nomor_kamar' => 'required|string|unique:rooms,nomor_kamar',
            'tarif_dasar' => 'required|integer|min:0',
            'status' => 'nullable|in:Kosong,Terisi',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = Room::create($request->all());

        return response()->json([
            'message' => 'Kamar berhasil ditambahkan',
            'room' => $room
        ], 201);
    }

    /**
     * Update room (Admin only)
     */
    public function update(Request $request, $id)
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
            'nomor_kamar' => 'sometimes|string|unique:rooms,nomor_kamar,' . $id,
            'tarif_dasar' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:Kosong,Terisi',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = Room::findOrFail($id);
        $room->update($request->all());

        return response()->json([
            'message' => 'Kamar berhasil diupdate',
            'room' => $room
        ]);
    }

    /**
     * Register new penghuni to room (Admin only)
     */
    public function registerPenghuni(Request $request)
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
            'nama' => 'required|string|max:255',
            'nomor_telepon' => 'required|string|unique:users,nomor_telepon',
            'nik' => 'required|string|size:16|unique:users,nik',
            'alamat_domisili' => 'nullable|string',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|string|min:6',
            'room_id' => 'required|exists:rooms,id',
            'foto_penghuni' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['foto_penghuni', 'password']);
        $data['password'] = Hash::make($request->password);
        $data['role'] = 'Penghuni';

        // Upload foto if exists
        if ($request->hasFile('foto_penghuni')) {
            $file = $request->file('foto_penghuni');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('foto_penghuni', $filename, 'public');
            $data['foto_penghuni'] = $path;
        }

        $penghuni = User::create($data);

        // Update room status
        $room = Room::findOrFail($request->room_id);
        $room->update(['status' => 'Terisi']);

        return response()->json([
            'message' => 'Penghuni berhasil didaftarkan',
            'penghuni' => $penghuni
        ], 201);
    }

    /**
     * Get room by ID (Admin or Penghuni for their own room)
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
                return response()->json(['error' => 'User not found'], 404);
            }

            // Admin can access any room, Penghuni can only access their own room
            if (!$user->isAdmin() && $user->room_id != $id) {
                return response()->json(['error' => 'Unauthorized - You can only access your own room'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }

        $room = Room::with('users')->findOrFail($id);
        return response()->json(['room' => $room]);
    }

    /**
     * Delete room (Admin only)
     */
    public function destroy(Request $request, $id)
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

        $room = Room::findOrFail($id);

        // Check if room has users
        if ($room->users()->count() > 0) {
            return response()->json(['error' => 'Tidak dapat menghapus kamar yang masih ditempati'], 400);
        }

        $room->delete();

        return response()->json(['message' => 'Kamar berhasil dihapus']);
    }

    /**
     * Remove resident from room (Admin only)
     */
    public function removeResident(Request $request, $id)
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

        $room = Room::findOrFail($id);

        // Check if room has residents
        if ($room->users()->count() === 0) {
            return response()->json(['error' => 'Kamar sudah kosong'], 400);
        }

        // Get the resident
        $resident = $room->users()->first();

        // Remove room_id from user
        $resident->update(['room_id' => null]);

        // Update room status to Kosong
        $room->update(['status' => 'Kosong']);

        return response()->json([
            'message' => 'Penghuni berhasil dikosongkan dari kamar',
            'room' => $room
        ]);
    }
}
