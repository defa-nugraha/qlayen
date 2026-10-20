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
npm run build
php artisan test
```

## Customer CRM MVP

The authenticated `/customers` screen supports creating, listing, searching, editing, and deleting customer records. Customer records include contact details, acquisition source, status, and follow-up date/notes. A customer interaction timeline is available from each customer row; members can record notes, calls, messages, purchases, or other interactions with a summary, optional details, occurrence time, and recording user. Interaction history is scoped through the customer in the selected workspace, ordered newest-first, and paginated. Interaction entries are append-only in this MVP. Customer list, search, creation, updates, and deletion are scoped to the selected workspace; cross-workspace customer IDs return 404. Workspace membership is checked server-side, including when a workspace ID is supplied directly. Workspace selection is available on the CRM screen.

Automated feature tests cover authentication, validation, create/read/update/delete, search, and cross-user isolation.

## Business workspace and tenant isolation

The authenticated `/workspaces` screen lets a user create a business workspace and view workspaces they belong to. Workspace membership uses a unique `(workspace_id, user_id)` constraint and records a role (`owner`, `admin`, or `member`). Creating a workspace and attaching its owner are performed in a database transaction. Feature tests cover guest access, validation, owner membership, unique membership, and visibility limited to a user's memberships.

The `/customers` and `/capture-links` screens support workspace selection. Customer list/search/create/update/delete operations are scoped to the selected workspace; capture-link listing/creation/toggling is scoped the same way. The public capture form stores consented customers in the workspace attached to that link. `WorkspaceContext` rejects workspace IDs for which the current user has no membership. Legacy records are backfilled by `2026_10_19_030000_add_workspace_id_to_customer_data.php`.

Workspace scoping for customer records and QR/NFC capture links is implemented in the current MVP: each authenticated CRM/campaign request resolves a workspace through the user's membership, data queries and mutations are scoped to that workspace, and public capture submissions are assigned to the workspace owning the capture link. Cross-workspace access tests cover listing and mutation. Workspace IDs are still nullable at the database level to support safe legacy-data migration; application-created records are assigned through workspace relationships. Workspace member role management is owner-only: owners can change non-owner members between admin/member and remove them; owner membership cannot be changed or removed. Invitations, ownership transfer, workspace deletion/retention policy, and role-specific authorization for customer/campaign actions remain out of scope and must be completed before production.

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

Authenticated users can create named QR or NFC capture links at `/capture-links`. Each campaign receives a random 48-character token and can be disabled to stop future submissions. The public `/c/{token}` form collects name, phone, optional email, and explicit consent; submitted records are added to the workspace associated with the capture link with a source of `QR` or `NFC` and a consent timestamp. Public endpoints are rate-limited, and authenticated capture-link management is scoped to the selected workspace after server-side membership validation.

The QR preview currently uses the external QR Server image endpoint and sends only the public capture URL to that service. NFC tags can store the same URL as an NDEF URI. For production, consider self-hosting QR generation if external image availability or third-party disclosure is unacceptable.

Known limitations: consent wording and retention/deletion policies need product/legal review; customer deduplication, automated follow-up scheduling/delivery, WhatsApp CRM integration and webhook processing, and a QR scan analytics dashboard are not yet implemented.
