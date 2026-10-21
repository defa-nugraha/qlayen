<?php

namespace Database\Seeders;

use App\Models\ActivationQrCode;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class ActivationQrCodeSeeder extends Seeder
{
    /**
     * Seed the QR and its required generator user, workspace, and membership.
     *
     * Optional environment variables:
     * - QLAYEN_ACTIVATION_QR_TOKEN
     * - QLAYEN_ACTIVATION_QR_NAME
     * - QLAYEN_ACTIVATION_QR_GENERATOR_EMAIL
     * - QLAYEN_ACTIVATION_QR_GENERATOR_NAME
     * - QLAYEN_ACTIVATION_QR_WORKSPACE_NAME
     */
    public function run(): void
    {
        $token = (string) config('services.qlayen_activation_qr.token', '5970c74bb9a39155b8dc9857');

        if (! preg_match('/^[A-Za-z0-9]{16,64}$/', $token)) {
            throw new RuntimeException('QLAYEN_ACTIVATION_QR_TOKEN must be 16-64 alphanumeric characters.');
        }

        DB::transaction(function () use ($token): void {
            $code = ActivationQrCode::query()->where('token', $token)->first();

            if ($code !== null) {
                $this->command->info(
                    "Activation QR {$token} already exists with status [{$code->status}]; related records and existing state were preserved."
                );

                return;
            }

            $generatorEmail = (string) config(
                'services.qlayen_activation_qr.generator_email',
                'activation-qr@qlayen.local',
            );
            $generatorName = (string) config(
                'services.qlayen_activation_qr.generator_name',
                'QLayen Activation Manager',
            );

            if (! filter_var($generatorEmail, FILTER_VALIDATE_EMAIL)) {
                throw new RuntimeException('QLAYEN_ACTIVATION_QR_GENERATOR_EMAIL must be a valid email address.');
            }

            $generator = User::query()->firstOrCreate(
                ['email' => $generatorEmail],
                [
                    'name' => $generatorName,
                    // This internal account gets a random, undisclosed password.
                    'password' => Str::random(64),
                ],
            );

            if ($generator->wasRecentlyCreated) {
                $generator->forceFill([
                    'role' => User::ROLE_OWNER,
                    'email_verified_at' => now(),
                ])->save();
            }

            $workspaceName = (string) config(
                'services.qlayen_activation_qr.workspace_name',
                'QLayen Activation Workspace',
            );

            $workspace = Workspace::query()->firstOrCreate(
                [
                    'owner_id' => $generator->id,
                    'name' => $workspaceName,
                ],
                [
                    'description' => 'System workspace used to manage pre-generated QLayen activation QR codes.',
                ],
            );

            $workspace->members()->syncWithoutDetaching([
                $generator->id => ['role' => User::ROLE_OWNER],
            ]);

            ActivationQrCode::query()->create([
                'generated_by_user_id' => $generator->id,
                'generated_workspace_id' => $workspace->id,
                'name' => (string) config('services.qlayen_activation_qr.name', 'QLayen Activation QR'),
                'token' => $token,
                'foreground_color' => '#111827',
                'background_color' => '#FFFFFF',
                'frame_text' => 'SCAN TO ACTIVATE',
                'status' => 'pending',
            ]);

            $this->command->info('Activation QR and its related generator user, workspace, and membership were seeded.');
            $this->command->info('Activation URL: '.route('activation-qr.show', $token));
            $this->command->info("Generator user ID: {$generator->id}; workspace ID: {$workspace->id}.");
        });
    }
}
