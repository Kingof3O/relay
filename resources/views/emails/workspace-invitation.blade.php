<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invitation to join {{ $workspace->name }} on Relay Studio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050608; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#050608" style="background-color: #050608; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #090a0f; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);">
                    <!-- Top Accent Bar -->
                    <tr>
                        <td height="4" style="height: 4px; background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%); font-size: 0; line-height: 0;">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <span style="font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Relay</span>
                                        <span style="font-size: 11px; font-family: monospace; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); color: #cbd5e1; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Studio</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #f8fafc; letter-spacing: -0.4px;">
                                You've been invited to join {{ $workspace->name }}
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                                You have been invited to collaborate as <strong style="color: #38bdf8;">{{ $role->name ?? 'Team Member' }}</strong> in the <strong style="color: #f1f5f9;">{{ $workspace->name }}</strong> workspace on Relay Studio.
                            </p>

                            <!-- Call to Action Button -->
                            <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 28px 0;">
                                <tr>
                                    <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);">
                                        <a href="{{ $invitationUrl }}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
                                            Accept Invitation & Join &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 16px 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                                This invitation link is cryptographically signed and will expire in <strong>7 days</strong>.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.5; word-break: break-all;">
                                If the button above doesn't work, copy and paste this link into your browser:<br />
                                <a href="{{ $invitationUrl }}" style="color: #0284c7; text-decoration: underline;">{{ $invitationUrl }}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 32px; background-color: #06070a; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #52525b;">
                                Relay Studio &middot; High-Velocity Engineering Studio & Delivery Engine
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
