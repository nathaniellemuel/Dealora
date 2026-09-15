<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Milestone extends Model
{
    protected $fillable = ['agreement_id', 'title', 'description', 'status', 'due_date', 'amount', 'completed_at'];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'amount' => 'decimal:2',
            'completed_at' => 'datetime',
        ];
    }

    public function agreement(): BelongsTo
    {
        return $this->belongsTo(Agreement::class);
    }

    public function deliverables(): HasMany
    {
        return $this->hasMany(Deliverable::class);
    }
}
