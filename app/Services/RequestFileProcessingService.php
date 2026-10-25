<?php

namespace App\Services;

use App\Enums\RequestFileProcessingStatus;
use App\Models\RequestFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\Process\Process;

final class RequestFileProcessingService
{
    public function process(RequestFile $file): void
    {
        $disk = Storage::disk(config('workspace.storage_disk'));
        $sourcePath = $file->source_path;

        if (blank($sourcePath) || ! $disk->exists($sourcePath)) {
            $this->failed($file, 'The temporary source file is no longer available.');

            return;
        }

        $source = $disk->path($sourcePath);
        $directory = "requests/{$file->request_id}";
        $token = (string) str()->uuid();
        $storedPath = null;
        $previewPath = null;

        try {
            if ($file->type === 'image') {
                $storedPath = "{$directory}/{$token}.webp";
                $output = $disk->path($storedPath);
                $this->ensureDirectory($output);
                [$width, $height] = $this->processImage($source, $output);

                $file->forceFill([
                    'stored_path' => $storedPath,
                    'preview_path' => null,
                    'mime_type' => 'image/webp',
                    'processing_status' => RequestFileProcessingStatus::Ready,
                    'processing_error' => null,
                    'width' => $width,
                    'height' => $height,
                    'duration' => null,
                    'source_path' => null,
                ])->save();
            } elseif ($file->type === 'video') {
                $storedPath = "{$directory}/{$token}.mp4";
                $previewPath = "{$directory}/{$token}.jpg";
                [$storedPath, $previewPath, $width, $height, $duration] = $this->processVideo(
                    $source,
                    $directory,
                    $token,
                    $disk,
                );

                $file->forceFill([
                    'stored_path' => $storedPath,
                    'preview_path' => $previewPath,
                    'mime_type' => 'video/mp4',
                    'processing_status' => RequestFileProcessingStatus::Ready,
                    'processing_error' => null,
                    'width' => $width,
                    'height' => $height,
                    'duration' => $duration,
                    'source_path' => null,
                ])->save();
            } else {
                $file->forceFill([
                    'processing_status' => RequestFileProcessingStatus::Ready,
                    'processing_error' => null,
                ])->save();

                return;
            }

            $disk->delete($sourcePath);
        } catch (\Throwable $exception) {
            foreach ([$storedPath, $previewPath] as $path) {
                if (filled($path) && $disk->exists($path)) {
                    $disk->delete($path);
                }
            }

            $this->failed($file, $exception->getMessage());
        }
    }

    public function failed(RequestFile $file, string $message): void
    {
        $file->forceFill([
            'processing_status' => RequestFileProcessingStatus::Failed,
            'processing_error' => str($message)->limit(2000)->toString(),
        ])->save();

        $request = $file->request()->with(['requester', 'assignee'])->first();

        if ($request !== null) {
            app(WorkRequestService::class)->recordActivity(
                $request,
                null,
                'file_processing_failed',
                "Media processing failed for {$file->original_name}.",
                ['file_id' => $file->id, 'error' => $file->processing_error],
            );
            app(WorkRequestService::class)->notifyRelevantUsers(
                $request,
                'media_failed',
                "Media processing failed for {$file->original_name}.",
            );
        }
    }

    /** @return array{0: int, 1: int} */
    private function processImage(string $source, string $output): array
    {
        if (class_exists(\Imagick::class)) {
            $image = new \Imagick($source);
            $image->setIteratorIndex(0);
            $image->thumbnailImage(2048, 2048, true);
            $image->setImageFormat('webp');
            $image->setImageCompressionQuality(82);
            $image->writeImage($output);
            $width = $image->getImageWidth();
            $height = $image->getImageHeight();
            $image->clear();
            $image->destroy();

            return [(int) $width, (int) $height];
        }

        $contents = file_get_contents($source);
        $image = $contents === false ? false : @imagecreatefromstring($contents);

        if ($image === false) {
            throw new RuntimeException('The image could not be decoded.');
        }

        $sourceWidth = imagesx($image);
        $sourceHeight = imagesy($image);
        $scale = min(1, 2048 / max($sourceWidth, $sourceHeight));
        $width = max(1, (int) round($sourceWidth * $scale));
        $height = max(1, (int) round($sourceHeight * $scale));
        $outputImage = imagecreatetruecolor($width, $height);
        imagealphablending($outputImage, false);
        imagesavealpha($outputImage, true);
        imagecopyresampled($outputImage, $image, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);

        if (! imagewebp($outputImage, $output, 82)) {
            imagedestroy($image);
            imagedestroy($outputImage);
            throw new RuntimeException('The WebP image could not be written.');
        }

        imagedestroy($image);
        imagedestroy($outputImage);

        return [$width, $height];
    }

    /** @return array{0: string, 1: string, 2: int, 3: int, 4: float|null} */
    private function processVideo(string $source, string $directory, string $token, mixed $disk): array
    {
        $storedPath = "{$directory}/{$token}.mp4";
        $previewPath = "{$directory}/{$token}.jpg";
        $output = $disk->path($storedPath);
        $poster = $disk->path($previewPath);
        $this->ensureDirectory($output);

        $transcode = new Process([
            config('workspace.ffmpeg_binary'),
            '-y',
            '-i',
            $source,
            '-vf',
            "scale='if(gt(iw,ih),min(iw,1920),-2)':'if(gt(iw,ih),-2,min(ih,1080))'",
            '-c:v',
            'libx264',
            '-preset',
            'medium',
            '-crf',
            '23',
            '-c:a',
            'aac',
            '-b:a',
            '128k',
            '-movflags',
            '+faststart',
            $output,
        ]);
        $transcode->setTimeout(3600);
        $transcode->run();

        if (! $transcode->isSuccessful()) {
            throw new RuntimeException(trim($transcode->getErrorOutput()) ?: 'FFmpeg could not transcode the video.');
        }

        $posterProcess = new Process([
            config('workspace.ffmpeg_binary'),
            '-y',
            '-i',
            $source,
            '-frames:v',
            '1',
            '-vf',
            "scale='if(gt(iw,ih),min(iw,1280),-2)':'if(gt(iw,ih),-2,min(ih,720))'",
            $poster,
        ]);
        $posterProcess->setTimeout(300);
        $posterProcess->run();

        if (! $posterProcess->isSuccessful()) {
            throw new RuntimeException(trim($posterProcess->getErrorOutput()) ?: 'FFmpeg could not create a video preview.');
        }

        $probe = new Process([
            config('workspace.ffprobe_binary'),
            '-v',
            'error',
            '-show_entries',
            'format=duration:stream=width,height',
            '-of',
            'json',
            $output,
        ]);
        $probe->setTimeout(120);
        $probe->run();

        if (! $probe->isSuccessful()) {
            throw new RuntimeException('FFprobe could not read the processed video.');
        }

        $metadata = json_decode($probe->getOutput(), true);
        $stream = collect($metadata['streams'] ?? [])->first(fn (array $stream): bool => isset($stream['width'], $stream['height'])) ?? [];

        return [
            $storedPath,
            $previewPath,
            (int) ($stream['width'] ?? 0),
            (int) ($stream['height'] ?? 0),
            isset($metadata['format']['duration']) ? (float) $metadata['format']['duration'] : null,
        ];
    }

    private function ensureDirectory(string $path): void
    {
        $directory = dirname($path);

        if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
            throw new RuntimeException("Could not create media directory: {$directory}");
        }
    }
}
