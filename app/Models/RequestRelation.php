<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestRelation extends Model
{
    use HasFactory;

    protected $table = 'request_relations';

    protected $fillable = [
        'request_id',
        'related_id',
        'type',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(WorkRequest::class, 'request_id');
    }

    public function related(): BelongsTo
    {
        return $this->belongsTo(WorkRequest::class, 'related_id');
    }
}
