<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Cycle;
use App\Models\RequestActivity;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
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

        $robin = $users->get('robin') ?? User::query()->first();
        if ($robin === null) {
            return;
        }

        $hussien = $users->get('hussien');
        $brother = $users->get('brother');
        $maya = $users->get('designer-1');
        $alex = $users->get('designer-2');

        $ownerRole = Role::query()->where('name', 'Owner')->first();
        $devRole = Role::query()->where('name', 'Developer')->first();
        $designerRole = Role::query()->where('name', 'Designer')->first();

        // =========================================================================
        // WORKSPACE 1: Kingof30
        // =========================================================================
        $ws1 = Workspace::query()->firstOrCreate(
            ['slug' => 'kingof30'],
            [
                'name' => 'Kingof30',
                'owner_id' => $robin->id,
            ]
        );

        if ($ownerRole) {
            $ws1->users()->syncWithoutDetaching([$robin->id => ['role_id' => $ownerRole->id]]);
        }
        if ($devRole && $hussien) {
            $ws1->users()->syncWithoutDetaching([$hussien->id => ['role_id' => $devRole->id]]);
        }
        if ($designerRole && $maya) {
            $ws1->users()->syncWithoutDetaching([$maya->id => ['role_id' => $designerRole->id]]);
        }

        // Projects for Workspace 1
        $ws1ProjectsData = [
            ['name' => 'Relay Core Platform', 'slug' => 'relay-core', 'color' => '#8B5CF6'],
            ['name' => 'Mobile App Engine', 'slug' => 'mobile-app', 'color' => '#06B6D4'],
            ['name' => 'API Gateway & Microservices', 'slug' => 'api-gateway', 'color' => '#10B981'],
            ['name' => 'Billing & Subscriptions', 'slug' => 'billing', 'color' => '#F59E0B'],
        ];

        $ws1Projects = collect();
        foreach ($ws1ProjectsData as $index => $item) {
            $area = Area::query()->updateOrCreate(
                ['workspace_id' => $ws1->id, 'slug' => $item['slug']],
                [
                    'name' => $item['name'],
                    'color' => $item['color'],
                    'sort_order' => $index,
                    'archived_at' => null,
                ]
            );
            $ws1Projects->put($item['slug'], $area);
        }

        // Cycles for Workspace 1
        $ws1Cycle1 = Cycle::query()->updateOrCreate(
            ['workspace_id' => $ws1->id, 'number' => 1],
            [
                'name' => 'Cycle 1 · Foundation & Architecture',
                'start_date' => now()->subDays(21)->toDateString(),
                'end_date' => now()->subDays(7)->toDateString(),
                'is_active' => false,
                'completed_at' => now()->subDays(7),
            ]
        );

        $ws1Cycle2 = Cycle::query()->updateOrCreate(
            ['workspace_id' => $ws1->id, 'number' => 2],
            [
                'name' => 'Cycle 2 · Core Platform Scale',
                'start_date' => now()->subDays(5)->toDateString(),
                'end_date' => now()->addDays(9)->toDateString(),
                'is_active' => true,
                'completed_at' => null,
            ]
        );

        // Tickets for Workspace 1
        $ws1Tickets = [
            [
                'project' => 'api-gateway',
                'cycle' => $ws1Cycle2,
                'title' => 'Add OpenTelemetry distributed tracing to API Gateway',
                'description' => 'Instrument all incoming microservice requests with W3C TraceContext headers, propagating span IDs to Redis queues and downstream workers.',
                'status' => 'new',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => null,
                'due_days' => 5,
                'tags' => ['telemetry', 'gateway'],
                'days_ago' => 1,
            ],
            [
                'project' => 'mobile-app',
                'cycle' => $ws1Cycle2,
                'title' => 'WebSocket reconnection debounce with jitter backoff',
                'description' => 'When mobile networks fluctuate between Wi-Fi and 5G, throttle reconnect bursts using exponential backoff with full jitter.',
                'status' => 'new',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'hussien',
                'assignee' => null,
                'due_days' => 7,
                'tags' => ['mobile', 'realtime'],
                'days_ago' => 2,
            ],
            [
                'project' => 'mobile-app',
                'cycle' => $ws1Cycle2,
                'title' => 'Biometric FaceID & TouchID support on iOS client',
                'description' => 'Implement secure Keychain token storage and native LocalAuthentication biometric challenge before opening sensitive team settings.',
                'status' => 'ready',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => 'hussien',
                'due_days' => 6,
                'tags' => ['ios', 'auth'],
                'days_ago' => 2,
                'comment' => 'Hardware testing verified on iPhone 16 Pro simulator.',
            ],
            [
                'project' => 'relay-core',
                'cycle' => $ws1Cycle2,
                'title' => 'Implement Redis connection pool circuit breaker',
                'description' => 'Gracefully degrade to local memory cache and log warnings when Redis instance latency exceeds 250ms threshold.',
                'status' => 'ready',
                'priority' => 'urgent',
                'points' => 8,
                'requester' => 'hussien',
                'assignee' => 'hussien',
                'due_days' => 4,
                'tags' => ['redis', 'resilience'],
                'days_ago' => 3,
            ],
            [
                'project' => 'relay-core',
                'cycle' => $ws1Cycle2,
                'title' => 'Migrate legacy MySQL JSON queries to typed casts',
                'description' => 'Eliminate slow inline string extraction functions in SQL by transitioning audit and metadata columns to typed Eloquent casts.',
                'status' => 'doing',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => 'hussien',
                'due_days' => 2,
                'tags' => ['backend', 'database'],
                'days_ago' => 4,
                'comment' => 'PR draft open with benchmark suite passing.',
            ],
            [
                'project' => 'relay-core',
                'cycle' => $ws1Cycle2,
                'title' => 'Design dark obsidian component library tokens',
                'description' => 'Standardize borders, specular highlights, and surface elevation tokens (#07090e, #090a0f, #111216) across all modal dialogs.',
                'status' => 'doing',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => 'designer-1',
                'due_days' => 3,
                'tags' => ['design', 'tokens'],
                'days_ago' => 3,
            ],
            [
                'project' => 'billing',
                'cycle' => $ws1Cycle2,
                'title' => 'Idempotency headers for stripe charge webhooks',
                'description' => 'Enforce strict Redis-backed replay protection on invoice.payment_succeeded events to prevent duplicate subscription grants.',
                'status' => 'review',
                'priority' => 'urgent',
                'points' => 3,
                'requester' => 'robin',
                'assignee' => 'hussien',
                'due_days' => 1,
                'tags' => ['billing', 'stripe'],
                'days_ago' => 5,
                'comment' => 'Submitted for code review and webhook replay testing.',
            ],
            [
                'project' => 'relay-core',
                'cycle' => $ws1Cycle2,
                'title' => 'Revamp team member invitation email template',
                'description' => 'Upgrade invitation notifications to restrained editorial typography with 1-click magic sign-in links.',
                'status' => 'review',
                'priority' => 'normal',
                'points' => 2,
                'requester' => 'hussien',
                'assignee' => 'designer-1',
                'due_days' => 2,
                'tags' => ['email', 'ui'],
                'days_ago' => 4,
            ],
            [
                'project' => 'api-gateway',
                'cycle' => $ws1Cycle2,
                'title' => 'Deploy multi-region database replica in eu-central-1',
                'description' => 'Setup cross-region asynchronous MariaDB replication for European enterprise clients.',
                'status' => 'doing',
                'priority' => 'urgent',
                'points' => 8,
                'requester' => 'robin',
                'assignee' => 'hussien',
                'is_blocked' => true,
                'blocked_reason' => 'Awaiting AWS Direct Connect private link provisioning from cloud team.',
                'due_days' => -1,
                'tags' => ['infrastructure', 'cloud'],
                'days_ago' => 6,
                'comment' => 'Blocked on cloud account VPC peering approval.',
            ],
            [
                'project' => 'relay-core',
                'cycle' => $ws1Cycle1,
                'title' => 'Zero-downtime deployment pipeline with healthcheck rollout',
                'description' => 'Configure blue-green container rollout verifying /up probe before routing production load balancing.',
                'status' => 'done',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => 'hussien',
                'due_days' => -8,
                'tags' => ['devops', 'ci-cd'],
                'days_ago' => 9,
            ],
            [
                'project' => 'relay-core',
                'cycle' => $ws1Cycle1,
                'title' => 'Upgrade React 18 frontend runtime to Vite 6 & Tailwind v4',
                'description' => 'Modernized bundle tree with ES module chunking and lightning-fast HMR.',
                'status' => 'done',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'hussien',
                'assignee' => 'hussien',
                'due_days' => -10,
                'tags' => ['frontend', 'vite'],
                'days_ago' => 12,
            ],
            [
                'project' => 'relay-core',
                'cycle' => $ws1Cycle1,
                'title' => 'Audit WCAG AA color contrast on obsidian surfaces',
                'description' => 'Verified 4.5:1 text-to-background contrast ratio on all badges, inputs, and muted metadata pills.',
                'status' => 'done',
                'priority' => 'low',
                'points' => 2,
                'requester' => 'robin',
                'assignee' => 'designer-1',
                'due_days' => -12,
                'tags' => ['a11y', 'design'],
                'days_ago' => 14,
            ],
        ];

        $this->seedTickets($ws1, $ws1Projects, $users, $ws1Tickets);

        // =========================================================================
        // WORKSPACE 2: Robin
        // =========================================================================
        $ws2 = Workspace::query()->firstOrCreate(
            ['slug' => 'robin'],
            [
                'name' => 'Robin',
                'owner_id' => $robin->id,
            ]
        );

        if ($ownerRole) {
            $ws2->users()->syncWithoutDetaching([$robin->id => ['role_id' => $ownerRole->id]]);
        }
        if ($devRole && $brother) {
            $ws2->users()->syncWithoutDetaching([$brother->id => ['role_id' => $devRole->id]]);
        }
        if ($designerRole && $alex) {
            $ws2->users()->syncWithoutDetaching([$alex->id => ['role_id' => $designerRole->id]]);
        }

        // Projects for Workspace 2
        $ws2ProjectsData = [
            ['name' => 'E-Commerce Storefront', 'slug' => 'storefront', 'color' => '#EC4899'],
            ['name' => 'Checkout & Logistics Engine', 'slug' => 'checkout-engine', 'color' => '#3B82F6'],
            ['name' => 'Design System & Motion', 'slug' => 'design-motion', 'color' => '#A855F7'],
        ];

        $ws2Projects = collect();
        foreach ($ws2ProjectsData as $index => $item) {
            $area = Area::query()->updateOrCreate(
                ['workspace_id' => $ws2->id, 'slug' => $item['slug']],
                [
                    'name' => $item['name'],
                    'color' => $item['color'],
                    'sort_order' => $index,
                    'archived_at' => null,
                ]
            );
            $ws2Projects->put($item['slug'], $area);
        }

        // Cycle for Workspace 2
        $ws2Cycle1 = Cycle::query()->updateOrCreate(
            ['workspace_id' => $ws2->id, 'number' => 1],
            [
                'name' => 'Sprint 1 · Q4 Commerce Overhaul',
                'start_date' => now()->subDays(3)->toDateString(),
                'end_date' => now()->addDays(11)->toDateString(),
                'is_active' => true,
                'completed_at' => null,
            ]
        );

        // Tickets for Workspace 2 (Completely distinct from Workspace 1)
        $ws2Tickets = [
            [
                'project' => 'checkout-engine',
                'cycle' => $ws2Cycle1,
                'title' => 'Audit checkout page for Apple Pay quick button integration',
                'description' => 'Inspect payment request API triggers for mobile Safari so users can complete orders with single-touch biometric pay.',
                'status' => 'new',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'robin',
                'assignee' => null,
                'due_days' => 6,
                'tags' => ['apple-pay', 'checkout'],
                'days_ago' => 1,
            ],
            [
                'project' => 'storefront',
                'cycle' => $ws2Cycle1,
                'title' => 'Multi-currency price rounding precision check',
                'description' => 'Ensure Japanese Yen amounts round to whole units while Euro and GBP maintain standard two-decimal precision.',
                'status' => 'new',
                'priority' => 'low',
                'points' => 2,
                'requester' => 'brother',
                'assignee' => null,
                'due_days' => 8,
                'tags' => ['currency', 'i18n'],
                'days_ago' => 2,
            ],
            [
                'project' => 'checkout-engine',
                'cycle' => $ws2Cycle1,
                'title' => 'Dynamic shipping cost calculation for DHL Express EU',
                'description' => 'Connect backend cart weight matrix with DHL rate API to compute exact volumetric shipping costs at checkout.',
                'status' => 'ready',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => 'brother',
                'due_days' => 4,
                'tags' => ['shipping', 'dhl'],
                'days_ago' => 2,
                'comment' => 'DHL staging API keys validated.',
            ],
            [
                'project' => 'checkout-engine',
                'cycle' => $ws2Cycle1,
                'title' => 'Fix Stripe 3D Secure modal dismissal on Safari iOS',
                'description' => 'When 3DS challenge frame is closed prematurely, restore checkout state instead of hanging the order spinner.',
                'status' => 'doing',
                'priority' => 'urgent',
                'points' => 8,
                'requester' => 'robin',
                'assignee' => 'brother',
                'due_days' => 1,
                'tags' => ['stripe', 'bug', 'checkout'],
                'days_ago' => 3,
                'comment' => 'Investigating iframe message listener event cancellation.',
            ],
            [
                'project' => 'design-motion',
                'cycle' => $ws2Cycle1,
                'title' => 'Animate cart drawer sliding panel with fluid spring physics',
                'description' => 'Implement Framer Motion spring physics with mass: 0.8 and damping: 24 for a buttery-smooth cart toggle interaction.',
                'status' => 'doing',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => 'designer-2',
                'due_days' => 4,
                'tags' => ['animation', 'motion', 'cart'],
                'days_ago' => 2,
                'comment' => 'Tuned bezier curve parameters in Storybook.',
            ],
            [
                'project' => 'storefront',
                'cycle' => $ws2Cycle1,
                'title' => 'Product catalog Elasticsearch multi-variant filtering',
                'description' => 'Re-index product colors, sizes, and in-stock badges with sub-second aggregations across 50,000 SKUs.',
                'status' => 'review',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'brother',
                'assignee' => 'brother',
                'due_days' => 2,
                'tags' => ['search', 'catalog'],
                'days_ago' => 4,
                'comment' => 'Submitted PR with query latency benchmarks under 28ms.',
            ],
            [
                'project' => 'checkout-engine',
                'cycle' => $ws2Cycle1,
                'title' => 'FedEx Freight API credentials setup for bulky pallet shipping',
                'description' => 'Require freight dispatch contract verification before heavy machinery items can calculate delivery estimates.',
                'status' => 'doing',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'robin',
                'assignee' => 'brother',
                'is_blocked' => true,
                'blocked_reason' => 'Awaiting FedEx enterprise account manager verification for freight rate endpoint access.',
                'due_days' => -1,
                'tags' => ['logistics', 'blocked'],
                'days_ago' => 5,
                'comment' => 'Contacted FedEx account representative yesterday.',
            ],
            [
                'project' => 'storefront',
                'cycle' => $ws2Cycle1,
                'title' => 'Next-gen WebP image delivery pipeline with Cloudflare Workers',
                'description' => 'Edge image optimization service resizing and caching high-res product hero galleries on demand.',
                'status' => 'done',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'brother',
                'assignee' => 'brother',
                'due_days' => -3,
                'tags' => ['performance', 'cdn'],
                'days_ago' => 7,
            ],
            [
                'project' => 'design-motion',
                'cycle' => $ws2Cycle1,
                'title' => 'Lottie micro-interaction for successful order placement',
                'description' => 'Designed lightweight 14KB vector animated checkmark with particle celebration for the confirmation page.',
                'status' => 'done',
                'priority' => 'low',
                'points' => 2,
                'requester' => 'designer-2',
                'assignee' => 'designer-2',
                'due_days' => -5,
                'tags' => ['lottie', 'ui'],
                'days_ago' => 8,
            ],
        ];

        $this->seedTickets($ws2, $ws2Projects, $users, $ws2Tickets);

        // Delete any legacy unparented null-workspace requests to ensure pristine clean data
        WorkRequest::query()->whereNull('workspace_id')->forceDelete();
        Area::query()->whereNull('workspace_id')->delete();
    }

    /**
     * @param \Illuminate\Support\Collection<string, Area> $projects
     * @param \Illuminate\Support\Collection<string, User> $users
     * @param array<int, array<string, mixed>> $tickets
     */
    private function seedTickets(Workspace $workspace, $projects, $users, array $tickets): void
    {
        foreach ($tickets as $data) {
            $area = $projects->get($data['project']);
            if ($area === null) {
                continue;
            }

            $requester = $users->get($data['requester']) ?? User::query()->first();
            $assignee = isset($data['assignee']) && $data['assignee'] !== null
                ? $users->get($data['assignee'])
                : null;

            $daysAgo = $data['days_ago'] ?? 0;
            $dueDate = isset($data['due_days'])
                ? now()->addDays($data['due_days'])->toDateString()
                : null;

            $request = WorkRequest::query()->updateOrCreate(
                [
                    'workspace_id' => $workspace->id,
                    'title' => $data['title'],
                ],
                [
                    'area_id' => $area->id,
                    'cycle_id' => $data['cycle']?->id,
                    'description' => $data['description'],
                    'status' => $data['status'],
                    'priority' => $data['priority'],
                    'story_points' => $data['points'] ?? 3,
                    'requester_id' => $requester->id,
                    'assignee_id' => $assignee?->id,
                    'due_date' => $dueDate,
                    'tags' => $data['tags'] ?? [],
                    'is_blocked' => $data['is_blocked'] ?? false,
                    'blocked_reason' => $data['blocked_reason'] ?? null,
                    'created_at' => now()->subDays($daysAgo)->subHours(rand(1, 12)),
                    'updated_at' => now()->subDays(max(0, $daysAgo - 1))->subHours(rand(1, 4)),
                ]
            );

            // Seed activities
            if (! RequestActivity::query()->where('request_id', $request->id)->where('type', 'created')->exists()) {
                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => $requester->id,
                    'type' => 'created',
                    'body' => 'Work request created.',
                    'created_at' => now()->subDays($daysAgo)->subHours(rand(1, 6)),
                ]);
            }

            if (isset($data['comment']) && ! RequestActivity::query()->where('request_id', $request->id)->where('type', 'comment')->exists()) {
                $commenter = $assignee ?? $requester;
                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => $commenter->id,
                    'type' => 'comment',
                    'body' => $data['comment'],
                    'created_at' => now()->subDays($daysAgo)->addHours(2),
                ]);
            }

            if (($data['is_blocked'] ?? false) === true && ! RequestActivity::query()->where('request_id', $request->id)->where('type', 'blocked')->exists()) {
                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => $requester->id,
                    'type' => 'blocked',
                    'body' => 'Roadblock flagged on ticket.',
                    'metadata' => ['reason' => $data['blocked_reason'] ?? null],
                    'created_at' => now()->subDays($daysAgo)->addHours(3),
                ]);
            }

            if ($data['status'] === 'done' && ! RequestActivity::query()->where('request_id', $request->id)->where('type', 'status_changed')->exists()) {
                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => ($assignee ?? $requester)->id,
                    'type' => 'status_changed',
                    'body' => 'Status changed to done.',
                    'metadata' => ['from' => 'review', 'to' => 'done'],
                    'created_at' => now()->subDays(max(1, $daysAgo - 1)),
                ]);
            }
        }
    }
}
