<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Integration\TestDiscordRequest;
use App\Http\Requests\Integration\TestEmailRequest;
use App\Http\Requests\Integration\UpdateDiscordSettingsRequest;
use App\Http\Requests\Integration\UpdateEmailSettingsRequest;
use App\Models\IntegrationDeliveryLog;
use App\Services\AuditService;
use App\Services\DiscordNotificationService;
use App\Services\EmailNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

final class IntegrationController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        $channelFilter = $request->input('channel');
        $statusFilter = $request->input('status');

        $logsQuery = IntegrationDeliveryLog::query()
            ->when($channelFilter, fn ($q) => $q->where('channel', $channelFilter))
            ->when($statusFilter, fn ($q) => $q->where('status', $statusFilter))
            ->latest('id');

        $totalLogs = (clone $logsQuery)->count();
        $logs = $logsQuery->take(50)->get()->map(fn ($log): array => [
            'id' => $log->id,
            'channel' => $log->channel,
            'event' => $log->event,
            'status' => $log->status,
            'target' => $log->target,
            'summary' => $log->summary,
            'error_message' => $log->error_message,
            'created_at' => $log->created_at?->toIso8601String(),
            'created_human' => $log->created_at?->diffForHumans(),
        ]);

        $kpis = [
            'total_dispatches' => IntegrationDeliveryLog::query()->count(),
            'discord_count' => IntegrationDeliveryLog::query()->where('channel', 'discord')->count(),
            'email_count' => IntegrationDeliveryLog::query()->where('channel', 'email')->count(),
            'failed_count' => IntegrationDeliveryLog::query()->where('status', 'failed')->count(),
            'success_rate' => IntegrationDeliveryLog::query()->count() > 0
                ? (int) round((IntegrationDeliveryLog::query()->where('status', 'success')->count() / max(IntegrationDeliveryLog::query()->count(), 1)) * 100)
                : 100,
        ];

        $discord = DiscordNotificationService::getStatus();
        $email = EmailNotificationService::getStatus();

        if ($request->wantsJson()) {
            return response()->json([
                'discord' => $discord,
                'email' => $email,
                'logs' => $logs,
                'kpis' => $kpis,
            ]);
        }

        return Inertia::render('Integrations/Index', [
            'discord' => $discord,
            'email' => $email,
            'logs' => $logs,
            'kpis' => $kpis,
            'canManage' => $user?->hasPermission('manage_workspace') ?? false,
        ]);
    }

    public function updateDiscord(UpdateDiscordSettingsRequest $request, AuditService $audit): JsonResponse
    {
        $validated = $request->validated();
        DiscordNotificationService::updateSettings($validated);

        $audit->log(
            $request->user(),
            'integration.discord_updated',
            null,
            [],
            ['enabled' => $validated['enabled'], 'has_webhook' => ! empty($validated['webhook_url'])]
        );

        return response()->json([
            'message' => 'Discord integration settings saved successfully.',
            'discord' => DiscordNotificationService::getStatus(),
        ]);
    }

    public function testDiscord(TestDiscordRequest $request): JsonResponse
    {
        $customUrl = $request->input('webhook_url');
        $result = DiscordNotificationService::ping($customUrl);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function updateEmail(UpdateEmailSettingsRequest $request, AuditService $audit): JsonResponse
    {
        $validated = $request->validated();
        EmailNotificationService::updateSettings($validated);

        $audit->log(
            $request->user(),
            'integration.email_updated',
            null,
            [],
            ['sender_name' => $validated['sender_name'], 'accent_color' => $validated['accent_color']]
        );

        return response()->json([
            'message' => 'Email template configuration saved successfully.',
            'email' => EmailNotificationService::getStatus(),
        ]);
    }

    public function testEmail(TestEmailRequest $request): JsonResponse
    {
        $event = (string) $request->input('event', 'assignment');
        $result = EmailNotificationService::sendTestEmail($request->user(), $event);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function previewEmail(Request $request): HttpResponse
    {
        $event = (string) $request->input('event', 'assignment');
        $html = EmailNotificationService::renderPreviewHtml($request->user(), $event);

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
