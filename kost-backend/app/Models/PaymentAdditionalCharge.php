<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentAdditionalCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'charge_type',
        'amount',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the payment that owns the charge
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
