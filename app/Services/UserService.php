<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

final class UserService
{
    /**
     * @param array<string, mixed> $validated
     */
    public function create(array $validated): User
    {
        $user = new User();
        $user->name = (string) $validated['name'];
        $user->username = (string) $validated['username'];
        $user->password = Hash::make((string) $validated['password']);
        $user->role_id = $validated['role_id'] ?? null;
        $user->active = (bool) ($validated['active'] ?? true);
        $user->save();

        return $user;
    }

    /**
     * @param array<string, mixed> $validated
     */
    public function update(User $user, array $validated): User
    {
        $user->name = (string) $validated['name'];
        $user->username = (string) $validated['username'];
        $user->role_id = $validated['role_id'] ?? null;
        $user->active = (bool) ($validated['active'] ?? true);

        if (array_key_exists('password', $validated) && is_string($validated['password']) && $validated['password'] !== '') {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return $user;
    }
}
