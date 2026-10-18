<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

final class WorkspaceInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public WorkspaceInvitation $invitation
    ) {
    }

    public function invitationUrl(): string
    {
        return URL::temporarySignedRoute(
            'invitations.accept',
            $this->invitation->expires_at,
            ['token' => $this->invitation->token]
        );
    }

    public function envelope(): Envelope
    {
        $workspaceName = $this->invitation->workspace?->name ?? 'Relay';

        return new Envelope(
            subject: "[Relay] You've been invited to join {$workspaceName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.workspace-invitation',
            with: [
                'invitation' => $this->invitation,
                'workspace' => $this->invitation->workspace,
                'role' => $this->invitation->role,
                'invitationUrl' => $this->invitationUrl(),
            ],
        );
    }
}
