<?php

namespace Database\Seeders;

use App\Models\ActivationQrCode;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use RuntimeException;

class ActivationQrCodeSeeder extends Seeder
{
    /**
     * Register the pre-generated activation QR token without resetting a QR
     * that has already been activated.
     *
     * Optional environment variables:
     * - QLAYEN_ACTIVATION_QR_TOKEN
     * - QLAYEN_ACTIVATION_QR_WORKSPACE_ID
     * - QLAYEN_ACTIVATION_QR_NAME
     */
    public function run(): void
    {
        $token = (string) env('QLAYEN_ACTIVATION_QR_TOKEN', '5970c74bb9a39155b8dc9857');

        if (! preg_match('/^[A-Za-z0-9]{16,64}$/', $token)) {
            throw new RuntimeException('QLAYEN_ACTIVATION_QR_TOKEN must be 16-64 alphanumeric characters.');
        }

        $existingCode = ActivationQrCode::query()->where('token', $token)->first();

        if ($existingCode !== null) {
            $this->command?->info(
                "Activation QR {$token} already exists with status [{$existingCode->status}]; existing state was preserved."
            );

            return;
        }

        $workspaceId = env('QLAYEN_ACTIVATION_QR_WORKSPACE_ID');
        $workspaceQuery = Workspace::query()->orderBy('id');

        if (filled($workspaceId)) {
            $workspaceQuery->whereKey((int) $workspaceId);
        }

        $workspace = $workspaceQuery->first();

        if ($workspace === null) {
            throw new RuntimeException(
                'No workspace was found for the activation QR. Set QLAYEN_ACTIVATION_QR_WORKSPACE_ID to an existing workspace ID.'
            );
        }

        $owner = $workspace->owner()->first();

        if ($owner === null) {
            throw new RuntimeException("Workspace {$workspace->id} has no valid owner.");
        }

        $workspace->members()->syncWithoutDetaching([
            $owner->id => ['role' => 'owner'],
        ]);

        ActivationQrCode::query()->create([
            'generated_by_user_id' => $owner->id,
            'generated_workspace_id' => $workspace->id,
            'name' => (string) env('QLAYEN_ACTIVATION_QR_NAME', 'QLayen Activation QR'),
            'token' => $token,
            'foreground_color' => '#111827',
            'background_color' => '#FFFFFF',
            'frame_text' => 'SCAN TO ACTIVATE',
            'status' => 'pending',
        ]);

        $this->command?->info(
            "Activation QR registered: ".route('activation-qr.show', $token)." (pending activation)."
        );
    }
}
