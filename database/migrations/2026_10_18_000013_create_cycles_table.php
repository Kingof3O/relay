<?php

declare(strict_types=1);

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
        Schema::create('cycles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->nullable()->constrained('workspaces')->cascadeOnDelete();
            $table->integer('number');
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::table('requests', function (Blueprint $table): void {
            $table->foreignId('cycle_id')->nullable()->constrained('cycles')->nullOnDelete();
            $table->foreignId('rolled_over_from_cycle_id')->nullable()->constrained('cycles')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('rolled_over_from_cycle_id');
            $table->dropConstrainedForeignId('cycle_id');
        });

        Schema::dropIfExists('cycles');
    }
};
