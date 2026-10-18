<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pull_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_request_id')->constrained('requests')->cascadeOnDelete();
            $table->string('provider')->default('github');
            $table->integer('pr_number');
            $table->string('title');
            $table->string('url');
            $table->string('status')->default('open'); // open, closed, merged
            $table->boolean('is_draft')->default(false);
            $table->string('review_status')->default('pending'); // pending, approved, changes_requested
            $table->timestamps();

            $table->index(['work_request_id', 'provider', 'pr_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pull_requests');
    }
};
