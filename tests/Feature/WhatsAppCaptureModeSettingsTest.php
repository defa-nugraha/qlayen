<?php

use App\Models\User;

it('allows only application admins to change the WhatsApp capture mode', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $member = User::factory()->create(['role' => 'member']);

    $this->actingAs($member)->get(route('admin.whatsapp-capture-mode'))->assertForbidden();
    $this->actingAs($member)->put(route('admin.whatsapp-capture-mode.update'), [
        'mode' => 'webhook',
        'message_template' => 'Halo. Kode: QLY-{token}',
    ])->assertForbidden();

    $this->actingAs($admin)->put(route('admin.whatsapp-capture-mode.update'), [
        'mode' => 'webhook',
        'message_template' => 'Halo. Kode: QLY-{token}',
    ])->assertRedirect(route('admin.whatsapp-capture-mode'));

    expect(\App\Models\QlayenSetting::read('whatsapp_capture', [])['mode'])->toBe('webhook');
});
