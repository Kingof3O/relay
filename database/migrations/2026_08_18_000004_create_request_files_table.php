<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_files', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('uploader_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('original_name');
            $table->string('source_path')->nullable();
            $table->string('stored_path')->nullable();
            $table->string('preview_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('original_mime_type')->nullable();
            $table->string('type', 20);
            $table->unsignedBigInteger('size')->default(0);
            $table->string('processing_status', 20)->default('processing');
            $table->text('processing_error')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->decimal('duration', 12, 3)->nullable();
            $table->timestamps();

            $table->index(['request_id', 'processing_status']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_files');
    }
};
