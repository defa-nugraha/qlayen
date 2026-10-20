<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dateTime('follow_up_completed_at')->nullable()->after('follow_up_notes');
            $table->index(['workspace_id', 'follow_up_completed_at']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['workspace_id', 'follow_up_completed_at']);
            $table->dropColumn('follow_up_completed_at');
        });
    }
};
