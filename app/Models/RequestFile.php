<?php

namespace App\Models;

use App\Enums\RequestFileProcessingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'uploader_id',
        'original_name',
        'source_path',
        'stored_path',
        'preview_path',
        'mime_type',
        'original_mime_type',
        'type',
        'size',
        'processing_status',
        'processing_error',
        'width',
        'height',
        'duration',
    ];

    protected function casts(): array
    {
        return [
            'processing_status' => RequestFileProcessingStatus::class,
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'duration' => 'float',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(WorkRequest::class, 'request_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
