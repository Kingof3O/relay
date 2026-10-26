<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RequestFileProcessingStatus;
use App\Jobs\SendRequestEmail;
use App\Models\Area;
use App\Models\Cycle;
use App\Models\RequestFile;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use App\Services\AuditService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

final class TenantBoundaryHardeningTest extends TestCase
{
    use RefreshDatabase;

    private User $userA;

    private Workspace $workspaceA;

    private Area $areaA;

    private Cycle $cycleA;

    private WorkRequest $ticketA;

    private string $tokenA;

    private User $userB;

    private Workspace $workspaceB;

    private Area $areaB;

    private Cycle $cycleB;

    private WorkRequest $ticketB;

    private string $tokenB;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $devRole = Role::query()->where('name', 'Developer')->firstOrFail();

        // Workspace A
        $this->userA = User::query()->where('username', 'robin')->firstOrFail();
        $this->workspaceA = Workspace::query()->create([
            'name' => 'Workspace Alpha',
            'slug' => 'workspace-alpha',
            'owner_id' => $this->userA->id,
        ]);
        $this->workspaceA->users()->syncWithoutDetaching([
            $this->userA->id => ['role_id' => $this->userA->role_id],
        ]);
        $this->areaA = Area::query()->create([
            'name' => 'Alpha Confidential Project',
            'slug' => 'alpha-confidential-project',
            'color' => '#10B981',
            'workspace_id' => $this->workspaceA->id,
        ]);
        $this->cycleA = Cycle::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'number' => 1,
            'name' => 'Alpha Cycle 1',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(14)->toDateString(),
            'is_active' => true,
        ]);
        $this->ticketA = WorkRequest::query()->create([
            'title' => 'Alpha Proprietary Task #1',
            'area_id' => $this->areaA->id,
            'requester_id' => $this->userA->id,
            'workspace_id' => $this->workspaceA->id,
            'cycle_id' => $this->cycleA->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);
        $this->tokenA = $this->userA->createToken('alpha-mcp-token')->plainTextToken;

        // Workspace B
        $this->userB = User::factory()->create([
            'username' => 'tenant_b_user',
            'name' => 'Tenant B User',
            'email' => 'tenant_b@example.com',
            'role_id' => $devRole->id,
            'active' => true,
        ]);
        $this->workspaceB = Workspace::query()->create([
            'name' => 'Workspace Beta',
            'slug' => 'workspace-beta',
            'owner_id' => $this->userB->id,
        ]);
        $this->workspaceB->users()->syncWithoutDetaching([
            $this->userB->id => ['role_id' => $devRole->id],
        ]);
        $this->areaB = Area::query()->create([
            'name' => 'Beta Secret Defense Project',
            'slug' => 'beta-secret-defense-project',
            'color' => '#EF4444',
            'workspace_id' => $this->workspaceB->id,
        ]);
        $this->cycleB = Cycle::query()->create([
            'workspace_id' => $this->workspaceB->id,
            'number' => 1,
            'name' => 'Beta Cycle 1',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(14)->toDateString(),
            'is_active' => true,
        ]);
        $this->ticketB = WorkRequest::query()->create([
            'title' => 'Beta Secret Task TOP_SECRET_B_123',
            'area_id' => $this->areaB->id,
            'requester_id' => $this->userB->id,
            'workspace_id' => $this->workspaceB->id,
            'cycle_id' => $this->cycleB->id,
            'status' => 'new',
            'priority' => 'urgent',
        ]);
        $this->tokenB = $this->userB->createToken('beta-mcp-token')->plainTextToken;

        $this->userA->refresh();
        $this->userB->refresh();
    }

    /**
     * Requirement 2.a: User/token from Workspace A cannot read, update, or delete requests belonging to Workspace B.
     */
    public function test_workspace_a_cannot_read_update_delete_or_restore_workspace_b_requests(): void
    {
        // 1. Web interface: Read
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get(route('requests.show', $this->ticketB))
            ->assertForbidden();

        // 2. Web interface: Update
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->patch(route('requests.update', $this->ticketB), [
                'title' => 'Hijacked Title by User A',
            ])
            ->assertForbidden();

        $this->assertEquals('Beta Secret Task TOP_SECRET_B_123', $this->ticketB->fresh()->title);

        // 3. Web interface: Delete
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->delete(route('requests.destroy', $this->ticketB))
            ->assertForbidden();

        $this->assertNull($this->ticketB->fresh()->deleted_at);

        // 4. Web interface: Clone
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->post(route('requests.clone', $this->ticketB))
            ->assertForbidden();

        // 5. API v1 / MCP endpoints: Read
        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->getJson("/api/v1/work-requests/{$this->ticketB->id}")
            ->assertForbidden();

        // 6. API v1 / MCP endpoints: Update
        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->patchJson("/api/v1/work-requests/{$this->ticketB->id}", [
                'title' => 'Malicious API Update by User A',
            ])
            ->assertForbidden();

        // 7. API v1 / MCP endpoints: Delete
        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->deleteJson("/api/v1/work-requests/{$this->ticketB->id}")
            ->assertForbidden();

        // 8. API v1 / MCP endpoints: Restore (soft-deleted ticket in Workspace B)
        $this->ticketB->delete();
        $this->assertNotNull($this->ticketB->fresh()->deleted_at);

        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->postJson("/api/v1/work-requests/{$this->ticketB->id}/restore")
            ->assertForbidden();

        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->post(route('requests.restore', $this->ticketB))
            ->assertForbidden();
    }

    /**
     * Requirement 2.b: User/token from Workspace A cannot inject Areas, Cycles, Users, or Parent requests from Workspace B.
     */
    public function test_workspace_a_cannot_inject_areas_cycles_users_or_parents_from_workspace_b(): void
    {
        // 1. Web PATCH update injection
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->patchJson(route('requests.update', $this->ticketA), [
                'area_id' => $this->areaB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['area_id']);

        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->patchJson(route('requests.update', $this->ticketA), [
                'cycle_id' => $this->cycleB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cycle_id']);

        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->patchJson(route('requests.update', $this->ticketA), [
                'assignee_id' => $this->userB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['assignee_id']);

        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->patchJson(route('requests.update', $this->ticketA), [
                'parent_id' => $this->ticketB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);

        // 2. Web Subtask creation injection: Cannot assign user from Workspace B
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->postJson(route('requests.subtasks.store', $this->ticketA), [
                'title' => 'Subtask with cross-tenant assignee',
                'assignee_id' => $this->userB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['assignee_id']);

        // 3. Request Relations injection: Cannot link tickets across workspaces
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->postJson(route('requests.relations.store', $this->ticketA), [
                'related_id' => $this->ticketB->id,
                'type' => 'blocks',
            ])
            ->assertStatus(422);

        // 4. API v1 Work Request Store injection
        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->postJson('/api/v1/work-requests', [
                'title' => 'Cross-Tenant Area Injection',
                'area_id' => $this->areaB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['area_id']);

        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->postJson('/api/v1/work-requests', [
                'title' => 'Cross-Tenant Cycle Injection',
                'area_id' => $this->areaA->id,
                'cycle_id' => $this->cycleB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cycle_id']);

        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->postJson('/api/v1/work-requests', [
                'title' => 'Cross-Tenant Assignee Injection',
                'area_id' => $this->areaA->id,
                'assignee_id' => $this->userB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['assignee_id']);

        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->postJson('/api/v1/work-requests', [
                'title' => 'Cross-Tenant Parent Injection',
                'area_id' => $this->areaA->id,
                'parent_id' => $this->ticketB->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);

        // 5. Bulk Creation injection
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->postJson(route('requests.bulk'), [
                'requests' => [
                    [
                        'title' => 'Bulk Valid Row',
                        'area_id' => $this->areaA->id,
                        'priority' => 'normal',
                    ],
                    [
                        'title' => 'Bulk Injected Area Row',
                        'area_id' => $this->areaB->id,
                        'priority' => 'normal',
                    ],
                    [
                        'title' => 'Bulk Injected Assignee Row',
                        'area_id' => $this->areaA->id,
                        'priority' => 'normal',
                        'assignee_id' => $this->userB->id,
                    ],
                ],
            ])
            ->assertOk()
            ->assertJson([
                'created' => 1,
                'failed' => 2,
            ]);
    }

    /**
     * Requirement 2.c: User/token from Workspace A cannot add comments or fetch attachments from Workspace B.
     */
    public function test_workspace_a_cannot_add_comments_or_fetch_attachments_from_workspace_b(): void
    {
        Storage::fake(config('workspace.storage_disk'));
        $disk = Storage::disk(config('workspace.storage_disk'));

        // Prepare test attachment for ticket B
        $filePath = 'attachments/workspace_b_secret_schematic.png';
        $disk->put($filePath, 'TOP_SECRET_BINARY_PAYLOAD');

        $attachmentB = RequestFile::query()->create([
            'request_id' => $this->ticketB->id,
            'uploader_id' => $this->userB->id,
            'original_name' => 'workspace_b_secret_schematic.png',
            'stored_path' => $filePath,
            'mime_type' => 'image/png',
            'type' => 'image',
            'size' => 1024,
            'processing_status' => RequestFileProcessingStatus::Ready,
        ]);

        // 1. Comments: Web store comment on Ticket B
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->postJson(route('requests.comments.store', $this->ticketB), [
                'body' => 'Spam comment from Workspace A',
            ])
            ->assertForbidden();

        // 2. Comments: API index comments on Ticket B
        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->getJson("/api/v1/work-requests/{$this->ticketB->id}/comments")
            ->assertForbidden();

        // 3. Comments: API store comment on Ticket B
        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->postJson("/api/v1/work-requests/{$this->ticketB->id}/comments", [
                'body' => 'API comment attempt across workspace boundary',
            ])
            ->assertForbidden();

        // 4. Attachments: Web download attachment from Ticket B
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get(route('requests.files.show', ['request' => $this->ticketB, 'file' => $attachmentB]))
            ->assertForbidden();

        // 5. Attachments: Web preview attachment from Ticket B
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get(route('requests.files.preview', ['request' => $this->ticketB, 'file' => $attachmentB]))
            ->assertForbidden();

        // 6. Attachments: Web upload attachment to Ticket B
        $fakeUpload = UploadedFile::fake()->create('malicious.pdf', 100);
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->postJson(route('requests.files.store', $this->ticketB), [
                'files' => [$fakeUpload],
            ])
            ->assertForbidden();

        // 7. Attachments: Web delete attachment from Ticket B
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->deleteJson(route('requests.files.destroy', ['request' => $this->ticketB, 'file' => $attachmentB]))
            ->assertForbidden();

        // 8. Attachments: Cross-request file manipulation (request A referencing file B)
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get(route('requests.files.show', ['request' => $this->ticketA, 'file' => $attachmentB]))
            ->assertNotFound();
    }

    /**
     * Requirement 2.d: User from Workspace A cannot export CSV data from Workspace B.
     */
    public function test_workspace_a_cannot_export_csv_data_from_workspace_b(): void
    {
        $uniqueBetaMarker = 'HIGHLY_CLASSIFIED_DEFENSE_METRIC_B_999';
        $this->ticketB->update([
            'title' => $uniqueBetaMarker,
        ]);

        // Export as CSV
        $response = $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get(route('requests.export', ['format' => 'csv']));

        $response->assertOk();
        $csvContent = $response->streamedContent();

        // Workspace A ticket must be present
        $this->assertStringContainsString('Alpha Proprietary Task #1', $csvContent);

        // Workspace B ticket must NOT be present
        $this->assertStringNotContainsString($uniqueBetaMarker, $csvContent);

        // Export as JSON
        $jsonResponse = $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get(route('requests.export', ['format' => 'json']));

        $jsonResponse->assertOk();
        $jsonContent = $jsonResponse->streamedContent();

        $this->assertStringContainsString('Alpha Proprietary Task #1', $jsonContent);
        $this->assertStringNotContainsString($uniqueBetaMarker, $jsonContent);
    }

    /**
     * Requirement 2.e: Mentions cannot receive or trigger across workspaces.
     */
    public function test_mentions_cannot_receive_or_trigger_across_workspaces(): void
    {
        Queue::fake([SendRequestEmail::class]);

        $this->assertEquals(0, $this->userB->notifications()->count());

        // User A comments on ticket A mentioning @tenant_b_user
        $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->postJson(route('requests.comments.store', $this->ticketA), [
                'body' => "Notice to @{$this->userB->username} regarding cross-tenant activity.",
            ])
            ->assertOk();

        // User B must NOT have received any database notification
        $this->assertEquals(0, $this->userB->notifications()->count());

        // Queue must NOT have received an email dispatch for user B
        Queue::assertNotPushed(SendRequestEmail::class, function ($job) {
            return $job->userId === $this->userB->id;
        });

        // Test same isolation via API v1 comments endpoint
        $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->postJson("/api/v1/work-requests/{$this->ticketA->id}/comments", [
                'body' => "API message mentioning @{$this->userB->username} across boundary.",
            ])
            ->assertStatus(201);

        $this->assertEquals(0, $this->userB->notifications()->count());
        Queue::assertNotPushed(SendRequestEmail::class, function ($job) {
            return $job->userId === $this->userB->id;
        });
    }

    /**
     * Requirement 2.f: User/token from Workspace A cannot invoke MCP API endpoints across workspaces.
     */
    public function test_mcp_api_endpoints_cannot_be_invoked_across_workspaces(): void
    {
        // 1. Briefing endpoint: Must only return Workspace A data
        $briefingRes = $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->getJson('/api/v1/briefing');

        $briefingRes->assertOk();
        $this->assertEquals($this->workspaceA->id, $briefingRes->json('workspace.id'));
        $this->assertNotEquals($this->workspaceB->id, $briefingRes->json('workspace.id'));

        $urgentTasks = collect($briefingRes->json('urgent_and_blocked'))->pluck('id')->all();
        $this->assertNotContains($this->ticketB->id, $urgentTasks);

        // 2. Work Requests list: Must only return Workspace A tasks
        $tasksRes = $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->getJson('/api/v1/work-requests');

        $tasksRes->assertOk();
        $taskIds = collect($tasksRes->json('data'))->pluck('id')->all();
        $this->assertContains($this->ticketA->id, $taskIds);
        $this->assertNotContains($this->ticketB->id, $taskIds);

        // 3. Projects list: Must only return Workspace A projects
        $projectsRes = $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->getJson('/api/v1/projects');

        $projectsRes->assertOk();
        $projectIds = collect($projectsRes->json('data'))->pluck('id')->all();
        $this->assertContains($this->areaA->id, $projectIds);
        $this->assertNotContains($this->areaB->id, $projectIds);

        // 4. Cycles list: Must only return Workspace A cycles
        $cyclesRes = $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->getJson('/api/v1/cycles');

        $cyclesRes->assertOk();
        $cycleIds = collect($cyclesRes->json('data'))->pluck('id')->all();
        $this->assertContains($this->cycleA->id, $cycleIds);
        $this->assertNotContains($this->cycleB->id, $cycleIds);

        // 5. Current Cycle endpoint: Must return Workspace A active cycle
        $currentCycleRes = $this->withHeader('Authorization', 'Bearer '.$this->tokenA)
            ->getJson('/api/v1/cycles/current');

        $currentCycleRes->assertOk();
        $this->assertEquals($this->cycleA->id, $currentCycleRes->json('active_cycle.id'));
        $this->assertNotEquals($this->cycleB->id, $currentCycleRes->json('active_cycle.id'));
    }

    /**
     * Requirement 3: Secret management, audit redaction, and logging sanitization.
     */
    public function test_secret_management_audit_sanitization_and_token_safety(): void
    {
        $auditService = app(AuditService::class);

        $sensitivePayload = [
            'username' => 'safe_agent_username',
            'password' => 'UltraSecretPassword123!',
            'password_confirmation' => 'UltraSecretPassword123!',
            'two_factor_secret' => 'BASE32SECRET123456',
            'two_factor_recovery_codes' => ['code1', 'code2'],
            'token' => 'plain_text_token_value_abc',
            'api_token' => 'api_secret_key_xyz',
            'reverb_app_secret' => 'super_reverb_secret',
            'metadata' => [
                'smtp_password' => 'smtp_super_secret',
                'safe_field' => 'retained_value',
            ],
        ];

        $sanitized = $auditService->sanitizeValues($sensitivePayload);

        $this->assertEquals('safe_agent_username', $sanitized['username']);
        $this->assertEquals('[REDACTED]', $sanitized['password']);
        $this->assertEquals('[REDACTED]', $sanitized['password_confirmation']);
        $this->assertEquals('[REDACTED]', $sanitized['two_factor_secret']);
        $this->assertEquals('[REDACTED]', $sanitized['two_factor_recovery_codes']);
        $this->assertEquals('[REDACTED]', $sanitized['token']);
        $this->assertEquals('[REDACTED]', $sanitized['api_token']);
        $this->assertEquals('[REDACTED]', $sanitized['reverb_app_secret']);
        $this->assertEquals('[REDACTED]', $sanitized['metadata']['smtp_password']);
        $this->assertEquals('retained_value', $sanitized['metadata']['safe_field']);

        // AuditService::log stores sanitized values in database
        $audit = $auditService->log(
            $this->userA,
            'security.test_event',
            $this->userA,
            $sensitivePayload,
            $sensitivePayload,
            $this->workspaceA->id
        );

        $this->assertEquals('[REDACTED]', $audit->fresh()->old_values['password']);
        $this->assertEquals('[REDACTED]', $audit->fresh()->new_values['password']);
        $this->assertEquals('[REDACTED]', $audit->fresh()->old_values['metadata']['smtp_password']);

        // User serialization hides secrets
        $userArray = $this->userA->toArray();
        $this->assertArrayNotHasKey('password', $userArray);
        $this->assertArrayNotHasKey('two_factor_secret', $userArray);
        $this->assertArrayNotHasKey('two_factor_recovery_codes', $userArray);
        $this->assertArrayNotHasKey('remember_token', $userArray);

        // Personal Access Token index does not leak hashed token value
        $tokensRes = $this->actingAs($this->userA)
            ->getJson(route('tokens.index'));

        $tokensRes->assertOk();
        $tokenList = $tokensRes->json('tokens');
        $this->assertNotEmpty($tokenList);
        foreach ($tokenList as $t) {
            $this->assertArrayNotHasKey('token', $t);
        }
    }
}
