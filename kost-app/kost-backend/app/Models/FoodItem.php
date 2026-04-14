<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_makanan',
        'nama_vendor',
        'harga',
        'gambar',
        'status_stok',
        'deskripsi',
    ];

    public function foodOrders()
    {
        return $this->hasMany(FoodOrder::class, 'food_id');
    }

    public function isAvailable()
    {
        return $this->status_stok === 'Tersedia';
    }

    public function isOutOfStock()
    {
        return $this->status_stok === 'Habis';
    }
}
