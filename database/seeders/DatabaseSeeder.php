<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed idempotent demo accounts for each role.
     *
     * Set QLAYEN_DEMO_USER_PASSWORD in the environment before seeding.
     * These accounts are intended for local/staging development, not production.
     */
    public function run(): void
    {
        $password = Hash::make((string) env('QLAYEN_DEMO_USER_PASSWORD', 'password'));

        $accounts = [
            ['name' => 'QLayen Demo Owner', 'email' => 'owner@qlayen.test', 'role' => User::ROLE_OWNER],
            ['name' => 'QLayen Demo Admin', 'email' => 'admin@qlayen.test', 'role' => User::ROLE_ADMIN],
            ['name' => 'QLayen Demo Member', 'email' => 'member@qlayen.test', 'role' => User::ROLE_MEMBER],
        ];

        $users = collect($accounts)->map(function (array $account) use ($password): User {
            $user = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'role' => $account['role'],
                    'password' => $password,
                ],
            );

            $user->forceFill(['email_verified_at' => now()])->save();

            return $user;
        });

        /** @var User $owner */
        $owner = $users->firstWhere('email', 'owner@qlayen.test');

        $workspace = Workspace::query()->firstOrCreate(
            [
                'owner_id' => $owner->id,
                'name' => 'QLayen Demo Workspace',
            ],
            [
                'description' => 'Workspace seeded for local and staging role testing.',
            ],
        );

        foreach ($accounts as $account) {
            $user = $users->firstWhere('email', $account['email']);
            $membership = DB::table('workspace_user')
                ->where('workspace_id', $workspace->id)
                ->where('user_id', $user->id)
                ->exists();

            $values = [
                'role' => $account['role'],
                'updated_at' => now(),
            ];

            if ($membership) {
                DB::table('workspace_user')
                    ->where('workspace_id', $workspace->id)
                    ->where('user_id', $user->id)
                    ->update($values);
            } else {
                DB::table('workspace_user')->insert([
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id,
                    ...$values,
                    'created_at' => now(),
                ]);
            }
        }
    }
}
