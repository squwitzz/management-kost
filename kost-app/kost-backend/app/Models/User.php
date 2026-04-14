<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nama',
        'email',
        'nomor_telepon',
        'nik',
        'alamat_domisili',
        'foto_penghuni',
        'password',
        'role',
        'room_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Override username untuk login menggunakan nomor_telepon
    public function getAuthIdentifierName()
    {
        return 'nomor_telepon';
    }

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relationships
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function foodOrders()
    {
        return $this->hasMany(FoodOrder::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Helper Methods
    public function isAdmin()
    {
        return $this->role === 'Admin';
    }

    public function isPenghuni()
    {
        return $this->role === 'Penghuni';
    }
}
