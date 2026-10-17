<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ideas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('content');
            $table->string('status')->default('new');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->foreignId('last_updated_by')->nullable()->constrained('users');
            $table->timestamp('last_reply_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['project_id']);
            $table->index(['status']);
            $table->index(['assigned_to']);
            $table->index(['last_reply_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ideas');
    }
};
