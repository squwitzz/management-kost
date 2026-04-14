<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peraturan extends Model
{
    use HasFactory;

    protected $table = 'peraturan';

    protected $fillable = [
        'judul',
        'deskripsi',
        'kategori',
        'urutan',
        'is_active',
        'icon',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'urutan' => 'integer',
    ];
}
