<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get a setting value by key, with optional default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        try {
            $record = self::query()->where('key', $key)->first();
            if ($record === null || $record->value === null) {
                return $default;
            }

            $decoded = json_decode($record->value, true);

            return (json_last_error() === JSON_ERROR_NONE) ? $decoded : $record->value;
        } catch (\Throwable) {
            return $default;
        }
    }

    /**
     * Persist a setting value by key.
     */
    public static function set(string $key, mixed $value): void
    {
        try {
            $serialized = is_array($value) || is_object($value) || is_bool($value)
                ? json_encode($value)
                : (string) $value;

            self::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $serialized]
            );
        } catch (\Throwable) {
            // Fallback gracefully if database is not available
        }
    }

    /**
     * Forget/delete a setting key from database.
     */
    public static function forget(string $key): void
    {
        try {
            self::query()->where('key', $key)->delete();
        } catch (\Throwable) {
            // Ignore
        }
    }
}
