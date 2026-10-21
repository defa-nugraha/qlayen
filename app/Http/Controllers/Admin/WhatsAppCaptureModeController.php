<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppCaptureModeController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('admin'), 403);

        return Inertia::render('admin/whatsapp-capture-mode', [
            'mode' => config('qlayen.whatsapp_capture_mode', 'form'),
            'webhookUrl' => route('whatsapp.webhook.incoming'),
            'webhookSecretConfigured' => filled(config('services.wa_gateway.webhook_secret')),
            'template' => (string) config('qlayen.whatsapp_message_template'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('admin'), 403);

        $data = $request->validate([
            'mode' => ['required', 'in:form,webhook'],
            'message_template' => ['required', 'string', 'max:1000'],
        ]);

        $path = base_path('storage/app/qlayen-settings/whatsapp-capture.json');
        $directory = dirname($path);

        if (! is_dir($directory)) {
            mkdir($directory, 0750, true);
        }

        $settings = [
            'mode' => $data['mode'],
            'message_template' => trim($data['message_template']),
            'updated_at' => now()->toIso8601String(),
            'updated_by' => (int) $request->user()->id,
        ];

        file_put_contents($path, json_encode($settings, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT), LOCK_EX);

        return to_route('admin.whatsapp-capture-mode')
            ->with('success', 'Mode pengumpulan kontak WhatsApp berhasil disimpan.');
    }
}
