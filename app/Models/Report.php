<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'user_id',
        'type',
        'service_type',
        'report_date',
        'week_number',
        'year',
        
        // Financial
        'total_income',
        'total_expenses',
        'balance',
        'cash_collection',
        'bank_deposit',
        'online_transfer',
        'other_income',
        'tithes',
        'offerings',
        'building_fund',
        'missions',
        'other_designations',
        
        // Attendance
        'new_members',
        'attendance',
        'first_timers',
        'conversions',
        'adults',
        'children',
        'men',
        'women',
        'boys',
        'girls',
        'toddlers',
        
        // Equipment
        'equipment_pledged',
        
        // Remittance
        'remittance_submitted',
        'remittance_date',
        'remittance_amount',
        
        // Attachments
        'attachments',
        
        // Notes & Status
        'notes',
        'status',
        'reviewed_by',
        'reviewed_at',
        
        // Submission tracking
        'submitted_at',
        'is_late',
    ];

    protected $casts = [
        'report_date' => 'date',
        'reviewed_at' => 'datetime',
        'submitted_at' => 'datetime',
        'total_income' => 'decimal:2',
        'total_expenses' => 'decimal:2',
        'balance' => 'decimal:2',
        'cash_collection' => 'decimal:2',
        'bank_deposit' => 'decimal:2',
        'online_transfer' => 'decimal:2',
        'other_income' => 'decimal:2',
        'tithes' => 'decimal:2',
        'offerings' => 'decimal:2',
        'building_fund' => 'decimal:2',
        'missions' => 'decimal:2',
        'other_designations' => 'decimal:2',
        'remittance_amount' => 'decimal:2',
        'remittance_submitted' => 'boolean',
        'is_late' => 'boolean',
        'equipment_pledged' => 'array',
        'attachments' => 'array',
    ];

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
