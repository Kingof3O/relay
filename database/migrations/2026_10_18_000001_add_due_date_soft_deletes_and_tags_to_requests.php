<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table): void {
            $table->date('due_date')->nullable()->after('blocked_reason');
            $table->json('tags')->nullable()->after('due_date');
            $table->softDeletes()->after('updated_at');

            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table): void {
            $table->dropIndex(['due_date']);
            $table->dropSoftDeletes();
            $table->dropColumn(['due_date', 'tags']);
        });
    }
};
