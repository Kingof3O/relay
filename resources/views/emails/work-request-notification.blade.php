@php
    $priority = strtolower($priority ?? 'normal');
    $baseAccent = $customAccentColor ?? '#8b5cf6';
    $accentGradient = match($priority) {
        'urgent' => 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
        'high' => 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        default => "linear-gradient(90deg, {$baseAccent} 0%, #6366f1 100%)",
    };
    $accentColor = match($priority) {
        'urgent' => '#f43f5e',
        'high' => '#f59e0b',
        default => $baseAccent,
    };
    $priorityTextColor = match($priority) {
        'urgent' => '#fda4af',
        'high' => '#fcd34d',
        default => '#c4b5fd',
    };
    $priorityBadgeBg = match($priority) {
        'urgent' => 'rgba(244, 63, 94, 0.12)',
        'high' => 'rgba(245, 158, 11, 0.12)',
        default => 'rgba(139, 92, 246, 0.12)',
    };
    $priorityBadgeBorder = match($priority) {
        'urgent' => 'rgba(244, 63, 94, 0.3)',
        'high' => 'rgba(245, 158, 11, 0.3)',
        default => 'rgba(139, 92, 246, 0.3)',
    };
    $statusValue = $workRequest->status?->value ?? (string) ($workRequest->status ?? 'new');
    $statusLabel = $workRequest->status?->label() ?? ucfirst(str_replace('_', ' ', $statusValue));
    $settingsUrl = url('/settings');
    $brandName = strtoupper($senderName ?? 'RELAY STUDIO');
    $logoSource = $logoUrl ?? url('/img/logo.png');
@endphp
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[Relay] #REQ-{{ $workRequest->id }} - {{ $workRequest->title }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e4e4e7; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f5f7" style="background-color: #f4f5f7; padding: 48px 16px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#090a0f" style="max-width: 580px; background-color: #090a0f; border-radius: 14px; border: 1px solid #1e2029; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);">
                    <!-- Top Minimal Accent Line -->
                    <tr>
                        <td height="3" bgcolor="{{ $accentColor }}" style="height: 3px; background: {{ $accentColor }}; background: {{ $accentGradient }}; font-size: 0; line-height: 0;">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Header with Real Brand Logo -->
                    <tr>
                        <td style="padding: 22px 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="vertical-align: middle; padding-right: 12px;">
                                                    <!-- Real Brand Logo Badge (Zero White Background) -->
                                                    <table border="0" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td width="30" height="30" align="center" valign="middle" style="width: 30px; height: 30px; background-color: #111216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;">
                                                                <img src="{{ $logoSource }}" width="18" height="18" alt="{{ $brandName }}" style="display: block; width: 18px; height: 18px; border: 0; outline: none; text-decoration: none;" />
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="vertical-align: middle;">
                                                    <span style="font-weight: 700; font-size: 13px; color: #ffffff; letter-spacing: 0.03em;">{{ $brandName }}</span>
                                                    <span style="color: #3f3f46; margin: 0 6px;">/</span>
                                                    <span style="font-size: 11px; color: #71717a; font-weight: 500;">Work Dispatch</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 6px; background-color: {{ $priorityBadgeBg }}; border: 1px solid {{ $priorityBadgeBorder }}; color: {{ $priorityTextColor }}; vertical-align: middle;">
                                            @if($event === 'assignment')
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                            @elseif($event === 'review')
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                            @elseif($event === 'done')
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><polyline points="20 6 9 17 4 12"/></svg>
                                            @elseif($event === 'reopened')
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                                            @elseif($event === 'blocked')
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                            @elseif($event === 'comment')
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                            @else
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                            @endif
                                            {{ $eventTag }}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 28px;">
                            <!-- Clear Contextual Summary Headline -->
                            <div style="font-size: 15px; font-weight: 500; color: #f4f4f5; line-height: 1.5; margin-bottom: 22px;">
                                {{ $messageText }}
                            </div>

                            <!-- Restrained Linear-Style Ticket Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#0c0d12" style="background-color: #0c0d12; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <!-- Card Top: Monospace Ticket Key & Status Indicator -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                                            <tr>
                                                <td align="left" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; font-weight: 600; color: #8b5cf6; letter-spacing: 0.02em;">
                                                    #REQ-{{ $workRequest->id }}
                                                </td>
                                                <td align="right">
                                                    <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 4px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); color: #d4d4d8;">
                                                        {{ $statusLabel }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Ticket Title -->
                                        <div style="font-size: 17px; font-weight: 700; color: #ffffff; line-height: 1.4; margin-bottom: 14px;">
                                            {{ $workRequest->title }}
                                        </div>

                                        <!-- Comment Quote or Description -->
                                        @if($event === 'comment')
                                            <div style="font-size: 13px; color: #e4e4e7; background-color: #121318; border-left: 3px solid #8b5cf6; padding: 12px 14px; border-radius: 0 6px 6px 0; margin-bottom: 16px; line-height: 1.6;">
                                                &ldquo;{{ Str::limit($messageText, 320) }}&rdquo;
                                            </div>
                                        @elseif(!empty($workRequest->description))
                                            <div style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 16px; border-left: 2px solid rgba(255, 255, 255, 0.12); padding-left: 12px;">
                                                {{ Str::limit($workRequest->description, 260) }}
                                            </div>
                                        @endif

                                        @if($workRequest->is_blocked && !empty($workRequest->blocked_reason))
                                            <div style="font-size: 12px; color: #fda4af; background-color: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 6px; padding: 9px 12px; margin-bottom: 16px; line-height: 1.5;">
                                                <strong style="color: #f43f5e;">Roadblock:</strong> {{ $workRequest->blocked_reason }}
                                            </div>
                                        @endif

                                        <!-- Metadata Properties Table -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px;">
                                            <tr>
                                                <td style="padding: 10px 0 6px 0; color: #71717a; width: 135px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; font-weight: 500;">Initiative / Project</td>
                                                <td style="padding: 10px 0 6px 0; color: #f4f4f5; font-weight: 600;">
                                                    {{ $workRequest->area?->name ?? 'General' }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; color: #71717a; width: 135px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; font-weight: 500;">Assignee</td>
                                                <td style="padding: 6px 0; color: #f4f4f5; font-weight: 600;">
                                                    {{ $workRequest->assignee?->name ?? 'Unassigned' }}
                                                    @if($workRequest->assignee?->username)
                                                        <span style="color: #71717a; font-weight: 400; font-family: ui-monospace, monospace; font-size: 11px;">(@<!-- -->{{ $workRequest->assignee->username }})</span>
                                                    @endif
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; color: #71717a; width: 135px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; font-weight: 500;">Requester</td>
                                                <td style="padding: 6px 0; color: #f4f4f5; font-weight: 600;">
                                                    {{ $workRequest->requester?->name ?? 'Unknown' }}
                                                    @if($workRequest->requester?->username)
                                                        <span style="color: #71717a; font-weight: 400; font-family: ui-monospace, monospace; font-size: 11px;">(@<!-- -->{{ $workRequest->requester->username }})</span>
                                                    @endif
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0 2px 0; color: #71717a; width: 135px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; font-weight: 500;">Priority</td>
                                                <td style="padding: 6px 0 2px 0; color: {{ $priorityTextColor }}; font-weight: 700;">
                                                    {{ $priorityLabel }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Primary Action Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" bgcolor="#ffffff" style="border-radius: 7px;">
                                                    <a href="{{ $url }}" target="_blank" style="display: inline-block; padding: 11px 22px; font-size: 13px; font-weight: 600; color: #090a0f; text-decoration: none; border-radius: 7px; background-color: #ffffff; letter-spacing: -0.01em;">
                                                        Open Work Request &rarr;
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="vertical-align: middle; font-size: 11px; color: #52525b; font-family: ui-monospace, monospace;">
                                        {{ $recipient->email }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Restrained Minimal Footer -->
                    <tr>
                        <td style="padding: 20px 28px; background-color: #06070a; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 11px; color: #52525b; line-height: 1.6;">
                            <div style="color: #71717a;">{{ $footerNote ?? 'Relay Studio · Enterprise Engineering & Dispatch Automation' }}</div>
                            <div style="margin-top: 4px;">
                                <a href="{{ $settingsUrl }}" style="color: #8b5cf6; text-decoration: none;">Notification Settings</a>
                                <span style="color: #3f3f46; margin: 0 4px;">·</span>
                                <span>Relay Dispatch Engine</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
