<?php

namespace App\Infrastructure\Messaging;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use UnexpectedValueException;

class WhatsAppGateway
{
    private const MEDIA_TYPES = [
        'image', 'video', 'audio', 'pdf', 'xls', 'xlsx', 'doc', 'docx', 'zip',
    ];

    /**
     * @return array<string, mixed>
     */
    public function sendMessage(string $number, string $message): array
    {
        return $this->post('send-message', [
            'number' => $number,
            'message' => $message,
        ]);
    }

    /**
     * @param array{media_type: string, url: string, caption?: string, ppt?: bool} $media
     * @return array<string, mixed>
     */
    public function sendMedia(string $number, array $media): array
    {
        if (!in_array($media['media_type'], self::MEDIA_TYPES, true)) {
            throw new InvalidArgumentException('Unsupported WhatsApp media type.');
        }

        if (filter_var($media['url'], FILTER_VALIDATE_URL) === false) {
            throw new InvalidArgumentException('Media URL must be a valid direct URL.');
        }

        return $this->post('send-media', [
            'number' => $number,
            'media_type' => $media['media_type'],
            'url' => $media['url'],
            'caption' => $media['caption'] ?? null,
            'ppt' => $media['ppt'] ?? null,
        ]);
    }

    /**
     * @param list<string> $buttons
     * @return array<string, mixed>
     */
    public function sendButton(
        string $number,
        string $message,
        array $buttons,
        ?string $footer = null,
        ?string $url = null,
    ): array {
        if (count($buttons) < 1 || count($buttons) > 5) {
            throw new InvalidArgumentException('WhatsApp button messages require between 1 and 5 buttons.');
        }

        return $this->post('send-button', [
            'number' => $number,
            'message' => $message,
            'button' => $buttons,
            'footer' => $footer,
            'url' => $url,
        ]);
    }

    /**
     * Requests a device QR code. The gateway may return "processing";
     * callers should request the endpoint again to retrieve the next state.
     *
     * @return array<string, mixed>
     */
    public function generateQr(string $device): array
    {
        return $this->post('generate-qe', [
            'device' => $device,
        ], includeSender: false);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    private function post(string $endpoint, array $payload, bool $includeSender = true): array
    {
        $apiKey = (string) config('services.wa_gateway.api_key');
        $sender = (string) config('services.wa_gateway.sender');

        if ($apiKey === '' || ($includeSender && $sender === '')) {
            throw new UnexpectedValueException('WhatsApp gateway credentials are not configured.');
        }

        $requestData = [
            ...$payload,
            'api_key' => $apiKey,
        ];

        if ($includeSender) {
            $requestData['sender'] = $sender;
        }

        $response = $this->http()->post($endpoint, $requestData)->throw();

        $data = $response->json();

        if (!is_array($data)) {
            throw new UnexpectedValueException('WhatsApp gateway returned an invalid JSON response.');
        }

        return $data;
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl(rtrim((string) config('services.wa_gateway.base_url'), '/').'/')
            ->acceptJson()
            ->asJson()
            ->connectTimeout(5)
            ->timeout(max(1, (int) config('services.wa_gateway.timeout', 15)));
    }
}
