<?php

namespace App\Http\Controllers;

use App\Enums\RequestFileProcessingStatus;
use App\Models\RequestFile;
use App\Models\WorkRequest;
use App\Services\RequestFileService;
use App\Services\WorkRequestPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class RequestFileController extends Controller
{
    public function __construct(
        private readonly RequestFileService $files,
        private readonly WorkRequestPresenter $presenter,
    ) {
    }

    public function store(Request $httpRequest, WorkRequest $request): JsonResponse
    {
        $this->authorize('upload', $request);
        $uploads = $httpRequest->file('files', []);
        $uploads = is_array($uploads) ? $uploads : [$uploads];

        if ($uploads === [] || $uploads === [null]) {
            return response()->json(['message' => 'Choose at least one file.'], 422);
        }

        $results = [];

        foreach ($uploads as $upload) {
            if (! $upload instanceof UploadedFile) {
                $results[] = ['success' => false, 'name' => 'Unknown file', 'errors' => ['file' => ['The upload was not received.']]];
                continue;
            }

            try {
                $file = $this->files->upload($request, $httpRequest->user(), $upload);
                $detail = $this->presenter->detail($request->fresh());
                $results[] = [
                    'success' => true,
                    'name' => $file->original_name,
                    'file' => collect($detail['files'] ?? [])->firstWhere('id', $file->id),
                ];
            } catch (ValidationException $exception) {
                $results[] = [
                    'success' => false,
                    'name' => $upload->getClientOriginalName(),
                    'errors' => $exception->errors(),
                ];
            } catch (\Throwable $exception) {
                report($exception);
                $results[] = [
                    'success' => false,
                    'name' => $upload->getClientOriginalName(),
                    'errors' => ['file' => ['The file could not be queued for processing.']],
                ];
            }
        }

        return response()->json([
            'results' => $results,
            'request' => $this->presenter->detail($request->fresh()),
        ]);
    }

    public function show(WorkRequest $request, RequestFile $file): BinaryFileResponse
    {
        $this->authorize('view', $request);
        $this->ensureBelongsToRequest($request, $file);

        if ($file->processing_status !== RequestFileProcessingStatus::Ready || blank($file->stored_path)) {
            abort(404);
        }

        $disk = \Storage::disk(config('workspace.storage_disk'));

        if (! $disk->exists($file->stored_path)) {
            abort(404);
        }

        return response()->file($disk->path($file->stored_path), [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => 'inline; filename="'.addslashes($file->original_name).'"',
        ]);
    }

    public function preview(WorkRequest $request, RequestFile $file): BinaryFileResponse
    {
        $this->authorize('view', $request);
        $this->ensureBelongsToRequest($request, $file);

        if ($file->processing_status !== RequestFileProcessingStatus::Ready || blank($file->preview_path)) {
            abort(404);
        }

        $disk = \Storage::disk(config('workspace.storage_disk'));

        if (! $disk->exists($file->preview_path)) {
            abort(404);
        }

        return response()->file($disk->path($file->preview_path), ['Content-Type' => 'image/jpeg']);
    }

    public function retry(Request $httpRequest, WorkRequest $request, RequestFile $file): JsonResponse
    {
        $this->authorize('upload', $request);
        $updated = $this->files->retry($request, $file);

        return response()->json([
            'file_id' => $updated->id,
            'processing_status' => $updated->processing_status?->value,
            'request' => $this->presenter->detail($request->fresh()),
        ]);
    }

    private function ensureBelongsToRequest(WorkRequest $request, RequestFile $file): void
    {
        if ($file->request_id !== $request->id) {
            abort(404);
        }
    }
}
