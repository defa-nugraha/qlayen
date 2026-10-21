<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QlayenSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppCaptureModeController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('admin'), 403);

        $settings = QlayenSetting::read('whatsapp_capture', []);

        return Inertia::render('admin/whatsapp-capture-mode', [
            'mode' => $settings['mode'] ?? config('qlayen.whatsapp_capture_mode', 'form'),
            'webhookUrl' => route('whatsapp.webhook.incoming'),
            'webhookSecretConfigured' => filled(config('services.wa_gateway.webhook_secret')),
            'template' => $settings['message_template'] ?? (string) config('qlayen.whatsapp_message_template'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('admin'), 403);

        $data = $request->validate([
            'mode' => ['required', 'in:form,webhook'],
            'message_template' => ['required', 'string', 'max:1000'],
        ]);

        if ($data['mode'] === 'webhook') {
            abort_unless(filled(config('services.wa_gateway.webhook_secret')), 422, 'Set WA_GATEWAY_WEBHOOK_SECRET sebelum mengaktifkan mode webhook.');
            abort_unless(str_contains($data['message_template'], '{token}'), 422, 'Template mode webhook wajib menyertakan {token}.');
        }

        $settings = [
            'mode' => $data['mode'],
            'message_template' => trim($data['message_template']),
            'updated_at' => now()->toIso8601String(),
            'updated_by' => (int) $request->user()->id,
        ];

        QlayenSetting::write('whatsapp_capture', $settings);

        return to_route('admin.whatsapp-capture-mode')
            ->with('success', 'Mode pengumpulan kontak WhatsApp berhasil disimpan.');
    }
}
