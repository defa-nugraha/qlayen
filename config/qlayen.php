<?php

return [
    'whatsapp_capture_mode' => env('QLAYEN_WHATSAPP_CAPTURE_MODE', 'form'),
    'whatsapp_message_template' => env(
        'QLAYEN_WHATSAPP_MESSAGE_TEMPLATE',
        'Halo, saya ingin terhubung dengan bisnis ini melalui QLayen. Kode: QLY-{token}',
    ),
];
