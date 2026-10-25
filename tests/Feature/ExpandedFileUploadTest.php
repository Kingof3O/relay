<?php

namespace Tests\Feature;

use App\Enums\RequestFileProcessingStatus;
use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\RequestFileService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

final class ExpandedFileUploadTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_uploading_pdf_document_creates_ready_document_record(): void
    {
        Storage::fake(config('workspace.storage_disk'));

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'PDF upload test',
            'requester_id' => $owner->id,
        ]);

        $service = app(RequestFileService::class);
        $pdfFile = UploadedFile::fake()->create('architecture-spec.pdf', 150, 'application/pdf');

        $file = $service->upload($request, $owner, $pdfFile);

        $this->assertEquals('document', $file->type);
        $this->assertEquals(RequestFileProcessingStatus::Ready, $file->processing_status);
        $this->assertNotNull($file->stored_path);
        Storage::disk(config('workspace.storage_disk'))->assertExists($file->stored_path);

        // Test downloading via HTTP
        $response = $this->actingAs($owner)->get(route('requests.files.show', [$request, $file]));
        $response->assertOk();
    }

    public function test_uploading_text_log_file_creates_ready_document_record(): void
    {
        Storage::fake(config('workspace.storage_disk'));

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Log upload test',
            'requester_id' => $owner->id,
        ]);

        $service = app(RequestFileService::class);
        $logFile = UploadedFile::fake()->create('server.log', 25, 'text/plain');

        $file = $service->upload($request, $owner, $logFile);

        $this->assertEquals('document', $file->type);
        $this->assertEquals(RequestFileProcessingStatus::Ready, $file->processing_status);
        $this->assertNotNull($file->stored_path);
        Storage::disk(config('workspace.storage_disk'))->assertExists($file->stored_path);

        // Test uploading via HTTP controller
        $jsonFile = UploadedFile::fake()->create('config.json', 10, 'application/json');
        $httpResponse = $this->actingAs($owner)->postJson(route('requests.files.store', $request), [
            'files' => [$jsonFile],
        ]);

        $httpResponse->assertOk();
        $this->assertDatabaseHas('request_files', [
            'request_id' => $request->id,
            'original_name' => 'config.json',
            'type' => 'document',
        ]);
    }

    public function test_uploading_zip_archive_creates_ready_document_record(): void
    {
        Storage::fake(config('workspace.storage_disk'));

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Zip upload test',
            'requester_id' => $owner->id,
        ]);

        $service = app(RequestFileService::class);
        $zipFile = UploadedFile::fake()->create('project-assets.zip', 500, 'application/zip');

        $file = $service->upload($request, $owner, $zipFile);

        $this->assertEquals('document', $file->type);
        $this->assertEquals(RequestFileProcessingStatus::Ready, $file->processing_status);
        $this->assertNotNull($file->stored_path);
        Storage::disk(config('workspace.storage_disk'))->assertExists($file->stored_path);

        // Download via HTTP
        $response = $this->actingAs($owner)->get(route('requests.files.show', [$request, $file]));
        $response->assertOk();

        // Also test controller HTTP endpoint with octet-stream mime for .zip
        $rawZip = UploadedFile::fake()->create('archive.zip', 300, 'application/octet-stream');
        $httpRes = $this->actingAs($owner)->postJson(route('requests.files.store', $request), [
            'files' => [$rawZip],
        ]);
        $httpRes->assertOk();
        $this->assertDatabaseHas('request_files', [
            'request_id' => $request->id,
            'original_name' => 'archive.zip',
            'type' => 'document',
        ]);
    }

    public function test_uploading_audio_file_creates_ready_audio_record_and_plays_via_http(): void
    {
        Storage::fake(config('workspace.storage_disk'));

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Audio upload test',
            'requester_id' => $owner->id,
        ]);

        $service = app(RequestFileService::class);
        $mp3File = UploadedFile::fake()->create('voice-note.mp3', 250, 'audio/mpeg');

        $file = $service->upload($request, $owner, $mp3File);

        $this->assertEquals('audio', $file->type);
        $this->assertEquals(RequestFileProcessingStatus::Ready, $file->processing_status);
        $this->assertNotNull($file->stored_path);
        Storage::disk(config('workspace.storage_disk'))->assertExists($file->stored_path);

        // Can stream / play audio via HTTP
        $response = $this->actingAs($owner)->get(route('requests.files.show', [$request, $file]));
        $response->assertOk();
        $this->assertStringContainsString('audio', $response->headers->get('Content-Type') ?? '');

        // Test controller HTTP endpoint for audio (wav)
        $wavFile = UploadedFile::fake()->create('sound-effect.wav', 120, 'audio/wav');
        $httpRes = $this->actingAs($owner)->postJson(route('requests.files.store', $request), [
            'files' => [$wavFile],
        ]);
        $httpRes->assertOk();
        $this->assertDatabaseHas('request_files', [
            'request_id' => $request->id,
            'original_name' => 'sound-effect.wav',
            'type' => 'audio',
        ]);
    }

    public function test_deleting_file_attachment_removes_record_and_purges_stored_file_from_disk(): void
    {
        Storage::fake(config('workspace.storage_disk'));

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'File delete test',
            'requester_id' => $owner->id,
        ]);

        $service = app(RequestFileService::class);
        $pdfFile = UploadedFile::fake()->create('contract.pdf', 100, 'application/pdf');
        $file = $service->upload($request, $owner, $pdfFile);

        $storedPath = $file->stored_path;
        $this->assertNotNull($storedPath);
        Storage::disk(config('workspace.storage_disk'))->assertExists($storedPath);

        // Delete via HTTP controller endpoint
        $response = $this->actingAs($owner)->deleteJson(route('requests.files.destroy', [$request, $file]));

        $response->assertOk();
        $response->assertJson(['deleted' => true]);

        // File is deleted from disk
        Storage::disk(config('workspace.storage_disk'))->assertMissing($storedPath);

        // File record is deleted from database
        $this->assertDatabaseMissing('request_files', ['id' => $file->id]);
    }

    public function test_deleting_work_request_purges_all_its_stored_files_from_disk(): void
    {
        Storage::fake(config('workspace.storage_disk'));

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Request cascade delete test',
            'requester_id' => $owner->id,
        ]);

        $service = app(RequestFileService::class);
        $file1 = $service->upload($request, $owner, UploadedFile::fake()->create('diagram.pdf', 100, 'application/pdf'));
        $file2 = $service->upload($request, $owner, UploadedFile::fake()->create('notes.txt', 20, 'text/plain'));

        $disk = Storage::disk(config('workspace.storage_disk'));
        $disk->assertExists($file1->stored_path);
        $disk->assertExists($file2->stored_path);

        // Delete the ticket
        $response = $this->actingAs($owner)->deleteJson(route('requests.destroy', $request));
        $response->assertOk();

        // Both files are physically purged from disk
        $disk->assertMissing($file1->stored_path);
        $disk->assertMissing($file2->stored_path);

        // Database records are removed
        $this->assertDatabaseMissing('request_files', ['id' => $file1->id]);
        $this->assertDatabaseMissing('request_files', ['id' => $file2->id]);
        $this->assertDatabaseMissing('requests', ['id' => $request->id]);
    }
}
