<?php

return [
    'bulk_chunk_size' => (int) env('REQUEST_BULK_CHUNK_SIZE', 25),
    'max_file_size_kb' => (int) env('REQUEST_MAX_FILE_SIZE_KB', 65536),
    'ffmpeg_binary' => (string) env('FFMPEG_BINARY', 'ffmpeg'),
    'ffprobe_binary' => (string) env('FFPROBE_BINARY', 'ffprobe'),
    'storage_disk' => (string) env('REQUEST_STORAGE_DISK', 'local'),
];
