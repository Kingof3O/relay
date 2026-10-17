<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table): void {
            $table->index(['is_blocked', 'priority', 'updated_at']);
            $table->index(['status', 'updated_at']);
            $table->index('created_at');
        });

        Schema::table('request_activities', function (Blueprint $table): void {
            $table->index(['type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table): void {
            $table->dropIndex(['is_blocked', 'priority', 'updated_at']);
            $table->dropIndex(['status', 'updated_at']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('request_activities', function (Blueprint $table): void {
            $table->dropIndex(['type', 'created_at']);
        });
    }
};
