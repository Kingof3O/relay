<?php

namespace App\Services;

use App\Enums\RequestFileProcessingStatus;
use App\Jobs\ProcessRequestFile;
use App\Models\RequestFile;
use App\Models\User;
use App\Models\WorkRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

final class RequestFileService
{
    public function __construct(private readonly WorkRequestService $requests)
    {
    }

    public function upload(WorkRequest $request, User $uploader, UploadedFile $uploadedFile): RequestFile
    {
        if (! $uploadedFile->isValid()) {
            throw ValidationException::withMessages([
                'file' => $uploadedFile->getErrorMessage(),
            ]);
        }

        $maxBytes = ((int) config('workspace.max_file_size_kb')) * 1024;

        if (($uploadedFile->getSize() ?: 0) > $maxBytes) {
            throw ValidationException::withMessages([
                'file' => 'Each file must be 64 MB or smaller.',
            ]);
        }

        $mime = (string) ($uploadedFile->getMimeType() ?: $uploadedFile->getClientMimeType());
        $extension = strtolower((string) ($uploadedFile->getClientOriginalExtension() ?: pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_EXTENSION)));

        $documentMimes = [
            'application/pdf',
            'text/plain',
            'application/json',
            'application/zip',
            'application/x-zip-compressed',
            'text/csv',
            'text/markdown',
            'text/x-log',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/xml',
            'text/xml',
        ];

        $documentExtensions = ['pdf', 'log', 'txt', 'text', 'json', 'zip', 'csv', 'md', 'markdown', 'doc', 'docx', 'xml'];

        if (str_starts_with($mime, 'image/')) {
            $type = 'image';
        } elseif (str_starts_with($mime, 'video/')) {
            $type = 'video';
        } elseif (in_array($mime, $documentMimes, true) || in_array($extension, $documentExtensions, true)) {
            $type = 'document';
        } else {
            $type = null;
        }

        if ($type === null) {
            throw ValidationException::withMessages([
                'file' => 'Only image, video, and document files are supported.',
            ]);
        }

        $diskName = config('workspace.storage_disk');

        if ($type === 'document') {
            $token = (string) str()->uuid();
            $extSuffix = $extension !== '' ? ".{$extension}" : '';
            $destinationPath = "requests/{$request->id}/{$token}{$extSuffix}";

            $disk = Storage::disk($diskName);
            $disk->put($destinationPath, file_get_contents($uploadedFile->getRealPath()));

            $storedFile = $request->files()->create([
                'uploader_id' => $uploader->id,
                'original_name' => str($uploadedFile->getClientOriginalName())->limit(255)->toString(),
                'source_path' => null,
                'stored_path' => $destinationPath,
                'mime_type' => $mime,
                'original_mime_type' => $mime,
                'type' => 'document',
                'size' => (int) ($uploadedFile->getSize() ?: 0),
                'processing_status' => RequestFileProcessingStatus::Ready,
            ]);

            $this->requests->recordActivity(
                $request,
                $uploader,
                'file_uploaded',
                "{$storedFile->original_name} attached.",
                ['file_id' => $storedFile->id, 'type' => 'document'],
            );

            return $storedFile;
        }

        $sourcePath = $uploadedFile->store('request-staging', $diskName);

        if (! is_string($sourcePath) || $sourcePath === '') {
            throw ValidationException::withMessages([
                'file' => 'The upload could not be staged for background processing.',
            ]);
        }

        $storedFile = $request->files()->create([
            'uploader_id' => $uploader->id,
            'original_name' => str($uploadedFile->getClientOriginalName())->limit(255)->toString(),
            'source_path' => $sourcePath,
            'mime_type' => $mime,
            'original_mime_type' => $mime,
            'type' => $type,
            'size' => (int) ($uploadedFile->getSize() ?: 0),
            'processing_status' => RequestFileProcessingStatus::Processing,
        ]);

        $this->requests->recordActivity(
            $request,
            $uploader,
            'file_uploaded',
            "{$storedFile->original_name} added and queued for processing.",
            ['file_id' => $storedFile->id, 'type' => $type],
        );

        ProcessRequestFile::dispatch($storedFile->id);

        return $storedFile;
    }

    public function retry(WorkRequest $request, RequestFile $file): RequestFile
    {
        if ($file->request_id !== $request->id) {
            abort(404);
        }

        if ($file->processing_status !== RequestFileProcessingStatus::Failed) {
            return $file;
        }

        $disk = Storage::disk(config('workspace.storage_disk'));

        if (blank($file->source_path) || ! $disk->exists($file->source_path)) {
            throw ValidationException::withMessages([
                'file' => 'The temporary source is no longer available. Please upload the file again.',
            ]);
        }

        $file->forceFill([
            'processing_status' => RequestFileProcessingStatus::Processing,
            'processing_error' => null,
        ])->save();

        ProcessRequestFile::dispatch($file->id);

        return $file;
    }

    public function deleteStoredFiles(RequestFile $file): void
    {
        $disk = Storage::disk(config('workspace.storage_disk'));

        foreach ([$file->source_path, $file->stored_path, $file->preview_path] as $path) {
            if (filled($path)) {
                $disk->delete($path);
            }
        }
    }
}
