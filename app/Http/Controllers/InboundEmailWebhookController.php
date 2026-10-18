<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkRequest;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class InboundEmailWebhookController extends Controller
{
    public function __invoke(Request $request, WorkRequestService $service): JsonResponse
    {
        // 1. Extract sender email
        $rawFrom = $request->input('From')
            ?? $request->input('FromFull.Email')
            ?? $request->input('sender')
            ?? $request->input('from')
            ?? $request->input('mail.source')
            ?? $request->input('mail.commonHeaders.from.0')
            ?? '';

        if (is_array($rawFrom)) {
            $rawFrom = implode(' ', $rawFrom);
        }

        $senderEmail = null;
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', (string) $rawFrom, $matches)) {
            $senderEmail = strtolower($matches[0]);
        }

        if (! $senderEmail) {
            return response()->json(['error' => 'Sender email could not be parsed from payload.'], 422);
        }

        // 2. Identify Ticket ID from recipient or subject
        $ticketId = null;
        $recipientCandidates = [
            $request->input('To'),
            $request->input('recipient'),
            $request->input('ToFull.0.Email'),
            $request->input('MailboxHash'),
            $request->input('mail.destination'),
            $request->input('receipt.recipients'),
        ];

        foreach ($recipientCandidates as $candidate) {
            if (is_array($candidate)) {
                $candidate = implode(' ', $candidate);
            }
            if ($candidate && preg_match('/(?:reply\+)?req-([0-9]+)/i', (string) $candidate, $matches)) {
                $ticketId = (int) $matches[1];
                break;
            }
        }

        if (! $ticketId) {
            $subject = (string) (
                $request->input('Subject')
                ?? $request->input('subject')
                ?? $request->input('mail.commonHeaders.subject')
                ?? ''
            );

            if (preg_match('/(?:\[Relay\]\s*)?#?REQ-([0-9]+)/i', $subject, $matches)) {
                $ticketId = (int) $matches[1];
            }
        }

        if (! $ticketId) {
            return response()->json(['error' => 'Could not determine ticket ID from recipient or subject.'], 422);
        }

        // 3. Find WorkRequest
        $ticket = WorkRequest::query()->find($ticketId);
        if (! $ticket) {
            return response()->json(['error' => "Work request #REQ-{$ticketId} not found."], 404);
        }

        // 4. Find Author by sender email
        $author = User::query()->where('email', $senderEmail)->first();
        if (! $author) {
            return response()->json(['error' => "User with email '{$senderEmail}' not found."], 422);
        }

        // 5. Extract Comment Body
        $body = (string) (
            $request->input('StrippedTextReply')
            ?? $request->input('stripped-text')
            ?? $request->input('stripped_text')
            ?? $request->input('TextBody')
            ?? $request->input('body-plain')
            ?? $request->input('text')
            ?? $request->input('content')
            ?? $request->input('body')
            ?? ''
        );

        $body = trim($body);
        if ($body === '') {
            $body = 'Empty email comment';
        }

        // 6. Create comment activity on the ticket
        $activity = $service->addComment($ticket, $author, $body);

        return response()->json([
            'status' => 'success',
            'ticket_id' => $ticket->id,
            'activity_id' => $activity->id,
            'comment' => $body,
        ], 201);
    }
}
