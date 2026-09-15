<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deliverable extends Model
{
    protected $fillable = ['agreement_id', 'milestone_id', 'title', 'description', 'file_url', 'status', 'submitted_by'];

    public function agreement(): BelongsTo
    {
        return $this->belongsTo(Agreement::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class);
    }
}
