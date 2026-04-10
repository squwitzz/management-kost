<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_kamar',
        'status',
        'tarif_dasar',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function isAvailable()
    {
        return $this->status === 'Kosong';
    }

    public function isOccupied()
    {
        return $this->status === 'Terisi';
    }
}
