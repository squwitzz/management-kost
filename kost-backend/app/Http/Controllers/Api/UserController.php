<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
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
     * List all residents (Admin only)
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $residents = User::where('role', 'Penghuni')->with('room')->get();

        return response()->json([
            'users' => $residents
        ]);
    }

    /**
     * Get user detail
     */
    public function show(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $targetUser = User::with('room')->find($id);

        if (!$targetUser) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'user' => $targetUser
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $rules = [
            'nama' => 'sometimes|string|max:255',
            'nomor_telepon' => 'sometimes|string|unique:users,nomor_telepon,' . $id,
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'alamat' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'pekerjaan' => 'nullable|string',
            'kontak_darurat' => 'nullable|string',
            'password' => 'nullable|string|min:6|confirmed',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user data
        $targetUser->fill($request->except(['password', 'password_confirmation']));

        // Update password if provided
        if ($request->filled('password')) {
            $targetUser->password = Hash::make($request->password);
        }

        $targetUser->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $targetUser
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Prevent deleting admin users
        if ($targetUser->role === 'Admin') {
            return response()->json([
                'message' => 'Cannot delete admin user'
            ], 403);
        }

        $targetUser->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
