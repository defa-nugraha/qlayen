<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('workspace_id')
                ->nullable()
                ->after('user_id')
                ->constrained('workspaces')
                ->cascadeOnDelete();
        });

        Schema::table('customer_capture_links', function (Blueprint $table) {
            $table->foreignId('workspace_id')
                ->nullable()
                ->after('user_id')
                ->constrained('workspaces')
                ->cascadeOnDelete();
        });

        DB::table('users')
            ->select(['id', 'name'])
            ->orderBy('id')
            ->chunk(100, function ($users): void {
                foreach ($users as $user) {
                    $workspaceId = DB::table('workspaces')
                        ->where('owner_id', $user->id)
                        ->orderBy('id')
                        ->value('id');

                    if ($workspaceId === null) {
                        $now = now();

                        $workspaceId = DB::table('workspaces')->insertGetId([
                            'owner_id' => $user->id,
                            'name' => mb_substr($user->name . "'s workspace", 0, 120),
                            'description' => 'Automatically created for existing customer data.',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }

                    DB::table('workspace_user')->insertOrIgnore([
                        'workspace_id' => $workspaceId,
                        'user_id' => $user->id,
                        'role' => 'owner',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('customers')
                        ->where('user_id', $user->id)
                        ->whereNull('workspace_id')
                        ->update(['workspace_id' => $workspaceId]);

                    DB::table('customer_capture_links')
                        ->where('user_id', $user->id)
                        ->whereNull('workspace_id')
                        ->update(['workspace_id' => $workspaceId]);
                }
            });

        Schema::table('customers', function (Blueprint $table) {
            $table->index(['workspace_id', 'name']);
            $table->index(['workspace_id', 'follow_up_at']);
        });

        Schema::table('customer_capture_links', function (Blueprint $table) {
            $table->index(['workspace_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('customer_capture_links', function (Blueprint $table) {
            $table->dropIndex(['workspace_id', 'is_active']);
            $table->dropConstrainedForeignId('workspace_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['workspace_id', 'name']);
            $table->dropIndex(['workspace_id', 'follow_up_at']);
            $table->dropConstrainedForeignId('workspace_id');
        });
    }
};
