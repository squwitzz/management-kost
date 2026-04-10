<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'food_id',
        'jumlah',
        'total_harga',
        'status_pesanan',
        'catatan',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function foodItem()
    {
        return $this->belongsTo(FoodItem::class, 'food_id');
    }

    public function isPending()
    {
        return $this->status_pesanan === 'Pending';
    }

    public function isProcessing()
    {
        return $this->status_pesanan === 'Diproses Vendor';
    }

    public function isCompleted()
    {
        return $this->status_pesanan === 'Selesai';
    }
}
