<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => $request->user()->notifications()->latest()->limit(50)->get()->map(fn ($notification): array => [
                'id' => $notification->id,
                'read_at' => $notification->read_at?->toIso8601String(),
                ...((array) $notification->data),
                'created_at' => $notification->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }

    public function read(Request $request, string $notification): JsonResponse
    {
        $request->user()->unreadNotifications()->whereKey($notification)->update(['read_at' => now()]);

        return response()->json(['read' => true]);
    }

    public function unread(Request $request, string $notification): JsonResponse
    {
        $request->user()->notifications()->whereKey($notification)->update(['read_at' => null]);

        return response()->json(['read' => false]);
    }

    public function toggle(Request $request, string $notification): JsonResponse
    {
        $item = $request->user()->notifications()->whereKey($notification)->first();
        if ($item === null) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $wasRead = $item->read_at !== null;
        $item->update(['read_at' => $wasRead ? null : now()]);

        return response()->json(['read' => ! $wasRead]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['read' => true]);
    }
}
