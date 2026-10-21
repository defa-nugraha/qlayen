<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'wa_gateway' => [
        'base_url' => env('WA_GATEWAY_BASE_URL', 'https://wa.digitalpelajar.id'),
        'api_key' => env('WA_GATEWAY_API_KEY'),
        'sender' => env('WA_GATEWAY_SENDER'),
        'timeout' => (int) env('WA_GATEWAY_TIMEOUT', 15),\n        'webhook_secret' => env('WA_GATEWAY_WEBHOOK_SECRET'),
    ],

    'qlayen_activation_qr' => [
        'token' => env('QLAYEN_ACTIVATION_QR_TOKEN', '5970c74bb9a39155b8dc9857'),
        'name' => env('QLAYEN_ACTIVATION_QR_NAME', 'QLayen Activation QR'),
        'generator_email' => env('QLAYEN_ACTIVATION_QR_GENERATOR_EMAIL', 'activation-qr@qlayen.local'),
        'generator_name' => env('QLAYEN_ACTIVATION_QR_GENERATOR_NAME', 'QLayen Activation Manager'),
        'workspace_name' => env('QLAYEN_ACTIVATION_QR_WORKSPACE_NAME', 'QLayen Activation Workspace'),
    ],

];
