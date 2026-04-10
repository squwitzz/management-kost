<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'billing_cycle_days',
        'due_date_day',
        'late_fee_percentage',
        'late_fee_amount',
        'grace_period_days',
        'auto_generate',
        'auto_generate_day',
        'enable_late_fee',
        'late_fee_type',
    ];

    protected $casts = [
        'billing_cycle_days' => 'integer',
        'due_date_day' => 'integer',
        'grace_period_days' => 'integer',
        'auto_generate_day' => 'integer',
        'auto_generate' => 'boolean',
        'enable_late_fee' => 'boolean',
        'late_fee_percentage' => 'decimal:2',
        'late_fee_amount' => 'decimal:2',
    ];

    /**
     * Get the singleton instance
     */
    public static function getSettings()
    {
        return self::first() ?? self::create([
            'billing_cycle_days' => 30,
            'due_date_day' => 5,
            'late_fee_amount' => 50000,
            'grace_period_days' => 3,
            'auto_generate' => false,
            'auto_generate_day' => 25,
            'enable_late_fee' => false,
            'late_fee_type' => 'fixed',
        ]);
    }
}
