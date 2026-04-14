<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'kategori',
        'deskripsi',
        'foto',
        'prioritas',
        'status',
        'is_draft',
        'catatan_admin',
        'resolved_at',
    ];

    protected $casts = [
        'is_draft' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
