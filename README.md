# QLayen

QLayen is being developed as a tenant-aware customer relationship and retention platform.

## Development quality gates

The GitHub Actions workflow runs formatting and static checks first. The unit/feature test job depends on the lint job and is skipped if lint or static checks fail.

Local checks:

```bash
composer lint:check
npm run check
npm run types:check
composer types:check
php artisan test
```

## Customer CRM MVP

The authenticated `/customers` screen supports creating, listing, searching, editing, and deleting customer records. Customer records include contact details, acquisition source, interaction notes, status, and follow-up date/notes. The controller scopes every list and mutation through the signed-in user's `customers()` relationship; cross-user record IDs return 404. The initial tenant boundary is per user account; shared business workspaces and team membership are not implemented yet.

Automated feature tests cover authentication, validation, create/read/update/delete, search, and cross-user isolation.

## WhatsApp gateway

The gateway client is implemented in `App\\Infrastructure\\Messaging\\WhatsAppGateway`. Configure the following environment variables:

```dotenv
WA_GATEWAY_BASE_URL=https://wa.digitalpelajar.id
WA_GATEWAY_API_KEY=
WA_GATEWAY_SENDER=
WA_GATEWAY_TIMEOUT=15
```

Never commit a real API key. Keep credentials in the deployment environment or a secrets manager.

Supported client operations:

- `sendMessage(number, message)`
- `sendMedia(number, media)`
- `sendButton(number, message, buttons, footer, url)`
- `generateQr(device)`

The QR method calls the documented `generate-qe` endpoint and returns the gateway payload as-is. If the gateway returns `status: processing`, call it again according to the provider's documented lifecycle. Message and media methods use POST JSON and propagate HTTP errors; a successful HTTP response does not necessarily mean the provider's `status` field is true, so callers must inspect that field.

Webhook handling and automated follow-up delivery should be implemented as separate application use cases with signature/authenticity verification where supported, idempotency, rate limits, and audit logging. Do not expose the gateway API key to the browser.

## QR/NFC customer capture MVP

Authenticated users can create named QR or NFC capture links at `/capture-links`. Each campaign receives a random 48-character token and can be disabled to stop future submissions. The public `/c/{token}` form collects name, phone, optional email, and explicit consent; submitted records are added to the campaign owner's customer list with a source of `QR` or `NFC` and a consent timestamp. Public endpoints are rate-limited, and campaign management is scoped to the authenticated owner.

The QR preview currently uses the external QR Server image endpoint and sends only the public capture URL to that service. NFC tags can store the same URL as an NDEF URI. For production, consider self-hosting QR generation if external image availability or third-party disclosure is unacceptable.

Known limitations: campaigns are owned by individual user accounts (shared business workspaces are not implemented); consent wording and retention/deletion policies need product/legal review; deduplication, interaction history, automated follow-up, WhatsApp delivery, and a QR scan analytics dashboard are not yet implemented.
