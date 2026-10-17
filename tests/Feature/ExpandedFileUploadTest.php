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
}
