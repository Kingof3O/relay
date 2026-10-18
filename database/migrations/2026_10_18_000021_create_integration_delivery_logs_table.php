<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_delivery_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->nullable()->constrained('workspaces')->nullOnDelete();
            $table->string('channel'); // 'discord' | 'email'
            $table->string('event');   // 'ticket.created', 'ticket.status', 'ticket.assigned', etc.
            $table->string('status');  // 'success' | 'failed' | 'queued'
            $table->string('target')->nullable(); // masked webhook url or recipient email
            $table->string('summary')->nullable();
            $table->json('payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['channel', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_delivery_logs');
    }
};
