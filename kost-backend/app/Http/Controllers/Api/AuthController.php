<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
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
            
            return User::with('room')->find($userId);
        } catch (\Exception $e) {
            return null;
        }
    }
    /**
     * Login penghuni menggunakan nomor telepon dan password
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomor_telepon' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('nomor_telepon', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Nomor telepon atau password salah'], 401);
        }

        $user = auth('api')->user();

        return response()->json([
            'message' => 'Login berhasil',
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'nomor_telepon' => $user->nomor_telepon,
                'role' => $user->role,
                'foto_penghuni' => $user->foto_penghuni,
                'room_id' => $user->room_id,
            ],
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => 3600
        ]);
    }

    /**
     * Get user profile
     */
    public function me(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'nomor_telepon' => $user->nomor_telepon,
                'nik' => $user->nik,
                'email' => $user->email,
                'alamat_domisili' => $user->alamat_domisili,
                'role' => $user->role,
                'foto_penghuni' => $user->foto_penghuni,
                'room_id' => $user->room_id,
                'room' => $user->room,
            ]
        ]);
    }

    /**
     * Logout user
     */
    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Logout berhasil']);
    }

    /**
     * Refresh token
     */
    public function refresh()
    {
        return response()->json([
            'access_token' => auth('api')->refresh(),
            'token_type' => 'bearer',
            'expires_in' => 3600
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'nomor_telepon' => 'sometimes|string|max:20',
            'alamat_domisili' => 'sometimes|string',
            'foto_penghuni' => 'sometimes|image|max:5120', // 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update fields
        if ($request->has('nama')) {
            $user->nama = $request->nama;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('nomor_telepon')) {
            $user->nomor_telepon = $request->nomor_telepon;
        }
        if ($request->has('alamat_domisili')) {
            $user->alamat_domisili = $request->alamat_domisili;
        }

        // Handle photo upload
        if ($request->hasFile('foto_penghuni')) {
            // Delete old photo if exists
            if ($user->foto_penghuni) {
                Storage::disk('public')->delete($user->foto_penghuni);
            }
            $path = $request->file('foto_penghuni')->store('foto_penghuni', 'public');
            $user->foto_penghuni = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'nomor_telepon' => $user->nomor_telepon,
                'nik' => $user->nik,
                'email' => $user->email,
                'alamat_domisili' => $user->alamat_domisili,
                'role' => $user->role,
                'foto_penghuni' => $user->foto_penghuni,
                'room_id' => $user->room_id,
                'room' => $user->room,
            ]
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }
}
