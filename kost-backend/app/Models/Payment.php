<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'jumlah_tagihan',
        'tarif_dasar',
        'total_additional_charges',
        'total_discount',
        'status_bayar',
        'bulan_dibayar',
        'due_date',
        'bukti_bayar',
        'notes',
        'is_finalized',
        'tanggal_upload',
        'tanggal_verifikasi',
        'finalized_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'is_finalized' => 'boolean',
            'tanggal_upload' => 'datetime',
            'tanggal_verifikasi' => 'datetime',
            'finalized_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function additionalCharges()
    {
        return $this->hasMany(PaymentAdditionalCharge::class);
    }

    public function isPending()
    {
        return $this->status_bayar === 'Menunggu Verifikasi';
    }

    public function isPaid()
    {
        return $this->status_bayar === 'Lunas';
    }

    public function isUnpaid()
    {
        return $this->status_bayar === 'Belum Lunas';
    }

    /**
     * Calculate total tagihan including additional charges and discount
     */
    public function calculateTotal()
    {
        $total = $this->tarif_dasar + $this->total_additional_charges - $this->total_discount;
        $this->jumlah_tagihan = $total;
        $this->save();
        return $total;
    }
}
