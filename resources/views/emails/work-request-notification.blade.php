@php
    $priority = strtolower($priority ?? 'normal');
    $accentGradient = match($priority) {
        'urgent' => 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
        'high' => 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        default => 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
    };
    $accentColor = match($priority) {
        'urgent' => '#f43f5e',
        'high' => '#f59e0b',
        default => '#8b5cf6',
    };
    $priorityTextColor = match($priority) {
        'urgent' => '#fda4af',
        'high' => '#fcd34d',
        default => '#c4b5fd',
    };
    $priorityBadgeBg = match($priority) {
        'urgent' => 'rgba(244, 63, 94, 0.15)',
        'high' => 'rgba(245, 158, 11, 0.15)',
        default => 'rgba(139, 92, 246, 0.15)',
    };
    $priorityBadgeBorder = match($priority) {
        'urgent' => 'rgba(244, 63, 94, 0.35)',
        'high' => 'rgba(245, 158, 11, 0.35)',
        default => 'rgba(139, 92, 246, 0.35)',
    };
    $statusValue = $workRequest->status?->value ?? (string) ($workRequest->status ?? 'new');
    $statusLabel = $workRequest->status?->label() ?? ucfirst($statusValue);
    $settingsUrl = url('/settings');
@endphp
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[Relay] #REQ-{{ $workRequest->id }} - {{ $workRequest->title }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050608; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#050608" style="background-color: #050608; padding: 40px 16px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #090a0f; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);">
                    <!-- Top Accent Bar -->
                    <tr>
                        <td height="4" bgcolor="{{ $accentColor }}" style="height: 4px; background: {{ $accentColor }}; background: {{ $accentGradient }}; font-size: 0; line-height: 0;">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding: 24px 28px 18px 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="vertical-align: middle; padding-right: 10px;">
                                                    <table border="0" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td width="26" height="26" bgcolor="#8b5cf6" style="width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); text-align: center; color: #ffffff; font-weight: 800; font-size: 13px; line-height: 26px;">
                                                                R
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="vertical-align: middle;">
                                                    <span style="font-weight: 800; font-size: 13px; color: #ffffff; letter-spacing: 0.02em;">RELAY STUDIO</span>
                                                    <span style="color: #52525b; margin: 0 4px;">/</span>
                                                    <span style="font-size: 11px; color: #a1a1aa; font-weight: 500;">Work Dispatch</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 9px; border-radius: 6px; background-color: {{ $priorityBadgeBg }}; border: 1px solid {{ $priorityBadgeBorder }}; color: {{ $priorityTextColor }};">
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
                            <!-- Contextual Message -->
                            <div style="font-size: 14px; color: #e4e4e7; line-height: 1.5; margin-bottom: 20px;">
                                {{ $messageText }}
                            </div>

                            <!-- Obsidian Ticket Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#0c0d12" style="background-color: #0c0d12; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <!-- Card Header: Monospace Ticket ID & Status Pill -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                                            <tr>
                                                <td align="left" style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 12px; font-weight: 600; color: #a1a1aa; letter-spacing: 0.02em;">
                                                    #REQ-{{ $workRequest->id }}
                                                </td>
                                                <td align="right">
                                                    <span style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 5px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #93c5fd;">
                                                        {{ $statusLabel }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Ticket Title -->
                                        <div style="font-size: 17px; font-weight: 700; color: #ffffff; line-height: 1.4; margin-bottom: 12px;">
                                            {{ $workRequest->title }}
                                        </div>

                                        <!-- Contextual Excerpt / Comment Excerpt -->
                                        @if($event === 'comment')
                                            <div style="font-size: 13px; color: #e4e4e7; background-color: #121318; border-left: 3px solid #8b5cf6; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; font-style: italic;">
                                                &ldquo;{{ Str::limit($messageText, 300) }}&rdquo;
                                            </div>
                                        @elseif(!empty($workRequest->description))
                                            <div style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 16px; border-left: 2px solid rgba(255, 255, 255, 0.1); padding-left: 12px;">
                                                {{ Str::limit($workRequest->description, 240) }}
                                            </div>
                                        @endif

                                        @if($workRequest->is_blocked && !empty($workRequest->blocked_reason))
                                            <div style="font-size: 12px; color: #fda4af; background-color: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 6px; padding: 8px 12px; margin-bottom: 16px;">
                                                <strong>Roadblock:</strong> {{ $workRequest->blocked_reason }}
                                            </div>
                                        @endif

                                        <!-- Metadata Table -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px;">
                                            <tr>
                                                <td style="padding: 10px 0 6px 0; color: #71717a; width: 130px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Initiative / Project</td>
                                                <td style="padding: 10px 0 6px 0; color: #f4f4f5; font-weight: 600;">
                                                    {{ $workRequest->area?->name ?? 'General' }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; color: #71717a; width: 130px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Requester</td>
                                                <td style="padding: 6px 0; color: #f4f4f5; font-weight: 600;">
                                                    {{ $workRequest->requester?->name ?? 'Unknown' }}
                                                    @if($workRequest->requester?->username)
                                                        <span style="color: #71717a; font-weight: 400;">(@<!-- -->{{ $workRequest->requester->username }})</span>
                                                    @endif
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; color: #71717a; width: 130px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Assignee</td>
                                                <td style="padding: 6px 0; color: #f4f4f5; font-weight: 600;">
                                                    {{ $workRequest->assignee?->name ?? 'Unassigned' }}
                                                    @if($workRequest->assignee?->username)
                                                        <span style="color: #71717a; font-weight: 400;">(@<!-- -->{{ $workRequest->assignee->username }})</span>
                                                    @endif
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0 2px 0; color: #71717a; width: 130px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Priority</td>
                                                <td style="padding: 6px 0 2px 0; color: {{ $priorityTextColor }}; font-weight: 700;">
                                                    {{ $priorityLabel }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Action Row -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" bgcolor="#ffffff" style="border-radius: 8px;">
                                                    <a href="{{ $url }}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: 700; color: #090a0f; text-decoration: none; border-radius: 8px; background-color: #ffffff; letter-spacing: -0.01em;">
                                                        Open Work Request &rarr;
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="vertical-align: middle; font-size: 11px; color: #71717a;">
                                        Sent to {{ $recipient->email }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 28px; background-color: #06070a; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 11px; color: #71717a; line-height: 1.6;">
                            <div>This transactional notification was generated automatically by Relay Studio.</div>
                            <div style="margin-top: 4px;">
                                Manage preferences in <a href="{{ $settingsUrl }}" style="color: #a78bfa; text-decoration: underline;">Notification Settings</a>.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
