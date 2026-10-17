<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_relations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('related_id')->constrained('requests')->cascadeOnDelete();
            $table->string('type', 30)->default('blocks'); // 'blocks', 'relates_to', 'duplicate'
            $table->timestamps();

            $table->unique(['request_id', 'related_id', 'type']);
            $table->index(['related_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_relations');
    }
};
