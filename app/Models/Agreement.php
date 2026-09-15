<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agreement extends Model
{
    use HasFactory;

    protected $fillable = [
        'agreement_id',
        'title',
        'description',
        'sow',
        'deliverables',
        'deadline',
        'budget',
        'payment_terms',
        'revision_policy',
        'status',
        'client_wallet',
        'freelancer_wallet',
        'client_id',
        'freelancer_id',
        'sow_hash',
        'tx_hash',
        'chain_id',
        'contract_address',
        'locked_at',
        'funded_amount',
        'escrow_status',
        'escrow_tx_hash',
    ];

    protected function casts(): array
    {
        return [
            'sow' => 'array',
            'deadline' => 'date',
            'budget' => 'decimal:2',
            'funded_amount' => 'decimal:2',
            'locked_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class)->latest();
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class);
    }

    public function deliverables(): HasMany
    {
        return $this->hasMany(Deliverable::class);
    }
}
