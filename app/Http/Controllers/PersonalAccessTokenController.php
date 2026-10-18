<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\PersonalAccessToken;

final class PersonalAccessTokenController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()
            ->latest('created_at')
            ->get(['id', 'name', 'abilities', 'last_used_at', 'expires_at', 'created_at']);

        return response()->json([
            'tokens' => $tokens,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'abilities' => ['nullable', 'array'],
            'abilities.*' => ['string'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $abilities = ! empty($validated['abilities']) ? $validated['abilities'] : ['*'];
        $expiresAt = ! empty($validated['expires_at']) ? Carbon::parse($validated['expires_at']) : null;

        $tokenResult = $request->user()->createToken(
            $validated['name'],
            $abilities,
            $expiresAt
        );

        return response()->json([
            'message' => 'Personal access token created successfully.',
            'token' => $tokenResult->plainTextToken,
            'plainTextToken' => $tokenResult->plainTextToken,
            'accessToken' => $tokenResult->accessToken,
        ], 201);
    }

    public function destroy(Request $request, mixed $token): JsonResponse
    {
        $tokenId = $token instanceof PersonalAccessToken ? $token->id : (int) $token;

        $pat = $request->user()->tokens()->where('id', $tokenId)->first();

        if (! $pat) {
            return response()->json(['message' => 'Token not found or unauthorized.'], 404);
        }

        $pat->delete();

        return response()->json([
            'message' => 'Personal access token revoked successfully.',
            'deleted' => true,
        ]);
    }
}
