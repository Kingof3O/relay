<?php

namespace Tests\Feature\Workspace;

use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\RequestFileService;
use Database\Seeders\DemoWorkspaceSeeder;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

final class RequestWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_bulk_creation_reports_successes_and_failures_per_row(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $response = $this->actingAs($owner)->postJson(route('requests.bulk'), [
            'requests' => [
                ['client_index' => 0, 'title' => 'Valid row', 'description' => 'One', 'area_id' => $area->id, 'priority' => 'normal'],
                ['client_index' => 1, 'title' => '', 'description' => 'Invalid', 'area_id' => $area->id, 'priority' => 'urgent'],
            ],
        ]);

        $response->assertOk()->assertJsonPath('created', 1)->assertJsonPath('failed', 1);
        $this->assertDatabaseHas('requests', ['title' => 'Valid row']);
        $this->assertDatabaseCount('requests', 1);
    }

    public function test_any_team_member_can_change_status_and_owner_is_notified(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $request = WorkRequest::query()->create([
            'area_id' => Area::query()->firstOrFail()->id,
            'title' => 'Review me',
            'description' => 'Description',
            'requester_id' => $owner->id,
        ]);

        $response = $this->actingAs($developer)->patchJson(route('requests.update', $request), [
            'status' => 'review',
            'assignee_id' => $developer->id,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('requests', ['id' => $request->id, 'status' => 'review', 'assignee_id' => $developer->id]);
        $this->assertDatabaseHas('request_activities', ['request_id' => $request->id, 'type' => 'status_changed']);
        $this->assertDatabaseHas('request_activities', ['request_id' => $request->id, 'type' => 'assignment_changed']);
        $this->assertDatabaseHas('notifications', ['notifiable_id' => $owner->id]);
    }

    public function test_image_upload_is_processed_to_webp(): void
    {
        Storage::fake('local');
        config(['workspace.storage_disk' => 'local']);
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $request = WorkRequest::query()->create([
            'area_id' => Area::query()->firstOrFail()->id,
            'title' => 'Attach an image',
            'requester_id' => $owner->id,
        ]);

        app(RequestFileService::class)->upload($request, $owner, UploadedFile::fake()->image('screen.png', 3000, 1000));
        $file = $request->fresh()->files()->firstOrFail();

        $this->assertSame('ready', $file->processing_status->value);
        $this->assertSame('image/webp', $file->mime_type);
        $this->assertLessThanOrEqual(2048, max($file->width, $file->height));
        Storage::disk('local')->assertExists($file->stored_path);
    }

    public function test_permanent_delete_removes_request_media(): void
    {
        Storage::fake('local');
        config(['workspace.storage_disk' => 'local']);
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $request = WorkRequest::query()->create([
            'area_id' => Area::query()->firstOrFail()->id,
            'title' => 'Delete me',
            'requester_id' => $owner->id,
        ]);
        Storage::disk('local')->put('requests/1/file.webp', 'binary');
        $request->files()->create([
            'uploader_id' => $owner->id,
            'original_name' => 'file.png',
            'stored_path' => 'requests/1/file.webp',
            'mime_type' => 'image/webp',
            'type' => 'image',
            'size' => 6,
            'processing_status' => 'ready',
        ]);

        $this->actingAs($owner)->deleteJson(route('requests.destroy', $request))->assertOk();
        $this->assertDatabaseMissing('requests', ['id' => $request->id]);
        $this->assertDatabaseMissing('request_files', ['request_id' => $request->id]);
        Storage::disk('local')->assertMissing('requests/1/file.webp');
    }

    public function test_developers_can_edit_team_member_information(): void
    {
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $brother = User::query()->where('username', 'brother')->firstOrFail();
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        $response = $this->actingAs($developer)->patchJson(route('settings.team.update', $brother), [
            'name' => 'Brother Updated',
            'email' => 'brother-updated@example.test',
            'role_id' => $ownerRole->id,
            'active' => true,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $brother->id,
            'name' => 'Brother Updated',
            'email' => 'brother-updated@example.test',
            'role_id' => $ownerRole->id,
        ]);
    }

    public function test_demo_seed_creates_requests_and_activity_without_media(): void
    {
        $this->seed(DemoWorkspaceSeeder::class);

        $this->assertDatabaseCount('requests', 21);
        $this->assertDatabaseCount('request_files', 0);
        $this->assertDatabaseCount('request_activities', 37);
        $this->assertDatabaseHas('requests', ['status' => 'review']);
        $this->assertDatabaseHas('requests', ['is_blocked' => true]);
    }
}
