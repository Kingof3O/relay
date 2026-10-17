<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Area;
use App\Models\RequestActivity;
use App\Models\User;
use App\Models\WorkRequest;
use App\Notifications\RequestDatabaseNotification;
use Illuminate\Database\Seeder;

final class DemoWorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->whereIn('username', ['robin', 'hussien', 'brother', 'designer-1', 'designer-2'])
            ->get()
            ->keyBy('username');

        $projects = Area::query()->get()->keyBy('slug');

        $requests = [
            // --- NEW (Triage Queue) ---
            [
                'project' => 'new-game',
                'title' => 'Prepare the first new game brief & mechanics spec',
                'description' => 'Collect the core gameplay loop, target round duration, scoring rules, and MVP milestone requirements into a unified design document.',
                'status' => 'new',
                'priority' => 'normal',
                'requester' => 'robin',
                'assignee' => null,
                'days_ago' => 0,
            ],
            [
                'project' => 'transfers',
                'title' => 'Recenter player team badges and back button icon',
                'description' => 'Adjust the transfer history card layout on smaller viewports so the team shield badges and navigation arrow align consistently with the title.',
                'status' => 'new',
                'priority' => 'normal',
                'requester' => 'designer-1',
                'assignee' => null,
                'days_ago' => 1,
            ],
            [
                'project' => 'app',
                'title' => 'Investigate frame drops during multi-user WebSocket reconnect',
                'description' => 'When more than 6 clients reconnect simultaneously after an idle timeout, the render loop hitches momentarily. Inspect the batch state dispatch.',
                'status' => 'new',
                'priority' => 'urgent',
                'requester' => 'hussien',
                'assignee' => null,
                'days_ago' => 0,
            ],
            [
                'project' => 'lms',
                'title' => 'Audio SFX crackling on Safari mobile WebAudio context',
                'description' => 'Certain sound effects click or pop on iOS Safari when triggered rapidly. Needs an unlocked master gain node or preloaded buffer pool.',
                'status' => 'new',
                'priority' => 'low',
                'requester' => 'designer-2',
                'assignee' => null,
                'days_ago' => 2,
            ],

            // --- READY (Ready for Development) ---
            [
                'project' => 'lms',
                'title' => 'Show every published game in available categories grid',
                'description' => 'The available categories catalog should display all published games instead of hiding items with empty tags.',
                'status' => 'ready',
                'priority' => 'urgent',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'days_ago' => 1,
                'comment' => 'Assigned to Hussien for immediate sprint kickoff.',
            ],
            [
                'project' => 'imposter',
                'title' => 'Allow host/admin to be selected as the imposter',
                'description' => 'When manual player selection is enabled, an admin playing in the session should be fully selectable as the secret imposter.',
                'status' => 'ready',
                'priority' => 'normal',
                'requester' => 'robin',
                'assignee' => 'brother',
                'days_ago' => 2,
            ],
            [
                'project' => 'new-game',
                'title' => 'Collect designer input for main launch screen',
                'description' => 'Consult the design team for preferred typography hierarchy, empty-state artwork, and dark obsidian visual direction.',
                'status' => 'ready',
                'priority' => 'normal',
                'requester' => 'designer-1',
                'assignee' => 'brother',
                'days_ago' => 1,
            ],
            [
                'project' => 'morph',
                'title' => 'Batch export texture assets for WebGL shader pipeline',
                'description' => 'Generate compressed WebP textures with power-of-two dimensions and 128x128 thumbnail mipmaps for fast card flipping.',
                'status' => 'ready',
                'priority' => 'low',
                'requester' => 'designer-2',
                'assignee' => 'hussien',
                'days_ago' => 3,
            ],

            // --- DOING (In Progress) ---
            [
                'project' => 'morph',
                'title' => 'Hide images already used in a marked playlist pool',
                'description' => 'When an image is marked as used, hide it from the random selector pool for every playlist that shares the same theme.',
                'status' => 'doing',
                'priority' => 'normal',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'days_ago' => 3,
                'comment' => 'Working on the pool exclusion query and cache invalidation.',
            ],
            [
                'project' => 'transfers',
                'title' => 'Fix transfer history around short loan returns',
                'description' => 'Players who return briefly from a loan show confusing duplicate club movements. Agree on an import deduplication rule before committing changes.',
                'status' => 'doing',
                'priority' => 'urgent',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'is_blocked' => true,
                'blocked_reason' => 'Need a final business rule for short loan returns before the database importer can be safely adjusted.',
                'days_ago' => 4,
                'comment' => 'Blocked while we choose the import rule that works across all historical player records.',
            ],
            [
                'project' => 'app',
                'title' => 'Finish the application security hardening pass',
                'description' => 'Review authentication cookies, CSP headers, file upload validation, and rate limiting before the next platform update.',
                'status' => 'doing',
                'priority' => 'urgent',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'days_ago' => 2,
                'comment' => 'Session lifetime and CSRF exemptions audited; finalizing upload MIME-sniffing rules.',
            ],
            [
                'project' => 'lms',
                'title' => 'Add keyboard arrow navigation for question grid',
                'description' => 'Allow studio hosts to navigate question cards using keyboard arrow keys (Up/Down/Left/Right) and trigger reveals with Spacebar.',
                'status' => 'doing',
                'priority' => 'normal',
                'requester' => 'designer-1',
                'assignee' => 'brother',
                'days_ago' => 1,
                'comment' => 'Focus trap and keydown event handlers mapped in React.',
            ],
            [
                'project' => 'app',
                'title' => 'Apple App Store notarization and provisioning profile',
                'description' => 'Update the signing certificates and entitlements for the macOS companion application release.',
                'status' => 'doing',
                'priority' => 'urgent',
                'requester' => 'hussien',
                'assignee' => 'brother',
                'is_blocked' => true,
                'blocked_reason' => 'Waiting for Apple Developer Account admin certificate renewal by the account holder.',
                'days_ago' => 3,
                'comment' => 'Pinged Robin to accept the updated developer program agreement.',
            ],

            // --- REVIEW (Awaiting Sign-off) ---
            [
                'project' => 'lms',
                'title' => 'Sort answers alphabetically by question text',
                'description' => 'In the host dashboard, sort answers by question text in the exact alphabetical order that contestants see on the big screen.',
                'status' => 'review',
                'priority' => 'normal',
                'requester' => 'robin',
                'assignee' => 'brother',
                'days_ago' => 2,
                'comment' => 'Implemented and ready for Robin to verify against the live game view.',
            ],
            [
                'project' => 'morph',
                'title' => 'Reset game should reset playlist progress to 0/40',
                'description' => 'Resetting an active game session should restore the counter to 0/40 and hide all revealed card overlays.',
                'status' => 'review',
                'priority' => 'normal',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'days_ago' => 1,
                'comment' => 'Verified on local staging; all counters reset properly.',
            ],
            [
                'project' => 'imposter',
                'title' => 'Card reveal flip animation easing curve',
                'description' => 'Refined the 3D card flip animation timing to use a smooth cubic-bezier curve with specular shadow expansion.',
                'status' => 'review',
                'priority' => 'low',
                'requester' => 'designer-2',
                'assignee' => 'brother',
                'days_ago' => 2,
                'comment' => 'Adjusted perspective and spring stiffness; please inspect on 120Hz display.',
            ],
            [
                'project' => 'transfers',
                'title' => 'Export player analytics CSV in UTF-8 BOM format',
                'description' => 'Ensure exported transfer spreadsheets open without character encoding issues in Excel on Windows and macOS.',
                'status' => 'review',
                'priority' => 'normal',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'days_ago' => 1,
                'comment' => 'Added standard byte-order mark; confirmed cleanly in Microsoft Excel.',
            ],

            // --- DONE (Completed) ---
            [
                'project' => 'lms',
                'title' => 'Hide the timer after a wrong answer or reveal',
                'description' => 'The countdown timer immediately hides when an answer is revealed or when the contestant presses the wrong answer buzzer.',
                'status' => 'done',
                'priority' => 'normal',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'days_ago' => 8,
                'comment' => 'Verified in the LMS game flow. Shipped to production.',
            ],
            [
                'project' => 'morph',
                'title' => 'Allow every card detail to be hidden independently',
                'description' => 'The game host setup allows toggling rate, position, nation, league, and club indicators individually.',
                'status' => 'done',
                'priority' => 'low',
                'requester' => 'robin',
                'assignee' => 'brother',
                'days_ago' => 7,
                'comment' => 'Merged and tested with all 5 card categories.',
            ],
            [
                'project' => 'app',
                'title' => 'Investigate the intermittent DNS issue report',
                'description' => 'Document the DNS/WARP workaround and verify whether network retries need custom exponential backoff.',
                'status' => 'done',
                'priority' => 'low',
                'requester' => 'robin',
                'assignee' => 'hussien',
                'days_ago' => 9,
                'comment' => 'Cloudflare split-tunneling exception documented for remote team members.',
            ],
            [
                'project' => 'app',
                'title' => 'Responsive navigation bar for tablet viewport',
                'description' => 'Refined drawer collapse behavior and bottom action bar for iPad landscape and portrait orientations.',
                'status' => 'done',
                'priority' => 'normal',
                'requester' => 'designer-1',
                'assignee' => 'hussien',
                'days_ago' => 5,
                'comment' => 'Tailwind breakpoint adjustments merged.',
            ],
        ];

        foreach ($requests as $data) {
            $project = $projects->get($data['project']);
            $requester = $users->get($data['requester']);

            if ($project === null || $requester === null) {
                continue;
            }

            $request = WorkRequest::query()->firstOrCreate(
                [
                    'area_id' => $project->id,
                    'title' => $data['title'],
                ],
                [
                    'description' => $data['description'],
                    'status' => $data['status'],
                    'priority' => $data['priority'],
                    'requester_id' => $requester->id,
                    'assignee_id' => isset($data['assignee']) && $data['assignee'] !== null
                        ? $users->get($data['assignee'])?->id
                        : null,
                    'is_blocked' => $data['is_blocked'] ?? false,
                    'blocked_reason' => $data['blocked_reason'] ?? null,
                ],
            );

            if (! $request->wasRecentlyCreated || $request->activities()->exists()) {
                continue;
            }

            $daysAgo = (int) $data['days_ago'];

            $request->forceFill([
                'created_at' => now()->subDays($daysAgo)->subHours(rand(1, 6)),
                'updated_at' => now()->subDays($daysAgo)->subMinutes(rand(5, 50)),
            ])->saveQuietly();

            RequestActivity::query()->create([
                'request_id' => $request->id,
                'user_id' => $requester->id,
                'type' => 'created',
                'body' => 'Request created.',
                'created_at' => now()->subDays($daysAgo)->subHours(rand(1, 6)),
            ]);

            if (isset($data['comment'])) {
                $commenter = isset($data['assignee']) && $data['assignee'] !== null
                    ? ($users->get($data['assignee']) ?? $requester)
                    : $requester;

                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => $commenter->id,
                    'type' => 'comment',
                    'body' => $data['comment'],
                    'created_at' => now()->subDays($daysAgo)->addHours(1),
                ]);
            }

            if (($data['is_blocked'] ?? false) === true) {
                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => $requester->id,
                    'type' => 'blocked',
                    'body' => 'Request blocked.',
                    'metadata' => ['reason' => $data['blocked_reason'] ?? null],
                    'created_at' => now()->subDays($daysAgo)->addHours(2),
                ]);
            }
        }

        // Seed notifications for Owner (Robin) and Developers (Hussien & Brother)
        $robin = $users->get('robin');
        $hussien = $users->get('hussien');
        $brother = $users->get('brother');

        if ($robin !== null) {
            $reviewRequest = WorkRequest::query()->where('status', 'review')->first();
            if ($reviewRequest !== null) {
                $robin->notify(new RequestDatabaseNotification([
                    'event' => 'status_changed',
                    'request_id' => $reviewRequest->id,
                    'request_title' => $reviewRequest->title,
                    'message' => "Brother submitted '{$reviewRequest->title}' for review.",
                    'url' => route('requests.show', $reviewRequest),
                ]));
            }

            $blockedRequest = WorkRequest::query()->where('is_blocked', true)->first();
            if ($blockedRequest !== null) {
                $robin->notify(new RequestDatabaseNotification([
                    'event' => 'blocked',
                    'request_id' => $blockedRequest->id,
                    'request_title' => $blockedRequest->title,
                    'message' => "Roadblock flagged on '{$blockedRequest->title}'.",
                    'url' => route('requests.show', $blockedRequest),
                ]));
            }
        }

        if ($hussien !== null) {
            $assignedRequest = WorkRequest::query()->where('assignee_id', $hussien->id)->where('status', 'doing')->first();
            if ($assignedRequest !== null) {
                $hussien->notify(new RequestDatabaseNotification([
                    'event' => 'assigned',
                    'request_id' => $assignedRequest->id,
                    'request_title' => $assignedRequest->title,
                    'message' => "Robin assigned you to '{$assignedRequest->title}'.",
                    'url' => route('requests.show', $assignedRequest),
                ]));
            }
        }

        if ($brother !== null) {
            $brotherRequest = WorkRequest::query()->where('assignee_id', $brother->id)->where('status', 'ready')->first();
            if ($brotherRequest !== null) {
                $brother->notify(new RequestDatabaseNotification([
                    'event' => 'assigned',
                    'request_id' => $brotherRequest->id,
                    'request_title' => $brotherRequest->title,
                    'message' => "New ticket ready in your queue: '{$brotherRequest->title}'.",
                    'url' => route('requests.show', $brotherRequest),
                ]));
            }
        }
    }
}
