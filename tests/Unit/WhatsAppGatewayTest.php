<?php

use App\Infrastructure\Messaging\WhatsAppGateway;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.wa_gateway.base_url' => 'https://wa.digitalpelajar.id',
        'services.wa_gateway.api_key' => 'test-api-key',
        'services.wa_gateway.sender' => '628123456789',
        'services.wa_gateway.timeout' => 10,
    ]);
});

test('sends a text message through the gateway', function () {
    Http::fake([
        'wa.digitalpelajar.id/send-message' => Http::response([
            'status' => true,
            'msg' => 'Message sent successfully!',
        ]),
    ]);

    $result = app(WhatsAppGateway::class)->sendMessage('628987654321', 'Hello QLayen');

    expect($result['status'])->toBeTrue();

    Http::assertSent(function ($request) {
        return $request->url() === 'https://wa.digitalpelajar.id/send-message'
            && $request['api_key'] === 'test-api-key'
            && $request['sender'] === '628123456789'
            && $request['number'] === '628987654321'
            && $request['message'] === 'Hello QLayen';
    });
});

test('rejects unsupported media types before making a request', function () {
    Http::fake();

    expect(fn () => app(WhatsAppGateway::class)->sendMedia('628987654321', [
        'media_type' => 'exe',
        'url' => 'https://example.com/file.exe',
    ]))->toThrow(InvalidArgumentException::class);

    Http::assertNothingSent();
});

test('rejects invalid button counts before making a request', function () {
    Http::fake();

    expect(fn () => app(WhatsAppGateway::class)->sendButton(
        '628987654321',
        'Choose one',
        [],
    ))->toThrow(InvalidArgumentException::class);

    Http::assertNothingSent();
});

test('returns processing state for QR generation without treating it as failure', function () {
    Http::fake([
        'wa.digitalpelajar.id/generate-qe' => Http::response([
            'status' => 'processing',
            'message' => 'Processing',
        ]),
    ]);

    $result = app(WhatsAppGateway::class)->generateQr('628123456789');

    expect($result['status'])->toBe('processing');
});

test('requires gateway credentials', function () {
    config(['services.wa_gateway.api_key' => null]);

    expect(fn () => app(WhatsAppGateway::class)->sendMessage('628987654321', 'Hello'))
        ->toThrow(UnexpectedValueException::class);
});

test('requests QR generation using the documented device payload', function () {
    Http::fake([
        'wa.digitalpelajar.id/generate-qe' => Http::response([
            'status' => 'processing',
            'message' => 'Processing',
        ]),
    ]);

    app(WhatsAppGateway::class)->generateQr('628123456789');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://wa.digitalpelajar.id/generate-qe'
            && $request['api_key'] === 'test-api-key'
            && $request['device'] === '628123456789'
            && ! isset($request['sender']);
    });
});
