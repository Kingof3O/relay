<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('follow_up_id')->nullable()->constrained('follow_ups')->cascadeOnDelete();
            $table->foreignId('uploader_id')->constrained('users');
            $table->string('original_name');
            $table->string('disk')->default('local');
            $table->string('path');
            $table->string('mime_type');
            $table->string('type');
            $table->unsignedBigInteger('size');
            $table->string('version')->nullable();
            $table->timestamps();

            $table->index(['project_id']);
            $table->index(['idea_id']);
            $table->index(['follow_up_id']);
            $table->index(['uploader_id']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
