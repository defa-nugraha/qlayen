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

Automated feature tests cover authentication, validation, create/read/update/delete, search, and cross-user isolation. Customer interaction history is available at `/customers/{customer}/interactions` (GET to list and POST to record); both endpoints require authentication and email verification, resolve the selected workspace server-side, and return 404 when the customer is outside that workspace. Interaction entries are append-only in the current MVP and are deleted when their customer is deleted.

## Follow-up workflow MVP

The authenticated `/follow-ups` screen lists scheduled follow-ups for active customers in the selected workspace. It provides overdue, due-today, upcoming, and all-scheduled filters; workspace-scoped search across customer name, phone, email, and follow-up notes; summary counts; and pagination. Date buckets use the application timezone and calendar-day boundaries. Customers without a follow-up date, inactive customers, and completed follow-ups are excluded from the active queue. Users can mark a scheduled follow-up complete; the completion timestamp is retained on the customer, and editing the follow-up date makes it pending again. Completion is workspace-scoped and protected by membership resolution. This remains a manual work queue: no notification or WhatsApp message is sent automatically, and delivery queues, retries, and scheduled reminders remain out of scope.

## Automated WhatsApp follow-up delivery

Customers can explicitly enable automated WhatsApp follow-up from the CRM form. The scheduler queues a delivery only when the customer is active, has a due follow-up date, has a phone number, has a recorded consent timestamp, and the WhatsApp follow-up option is enabled. The option defaults to off. Do not enable it unless the customer has agreed to receive WhatsApp follow-up messages.

Each delivery is recorded in `customer_follow_up_deliveries` with a unique customer/scheduled-time key, status, attempts, provider response, and send timestamp. Queue jobs re-check customer eligibility before sending and treat a provider response as accepted only when its `status` value is boolean `true`. Failed queue attempts use backoff; exhausted failures are marked failed for investigation. A delivery that is already sent is not sent again by a repeated job execution.

Operational requirements:
- Run the Laravel scheduler every minute using the standard `php artisan schedule:run` cron entry.
- Run a queue worker (for example, `php artisan queue:work --tries=3`) to process delivery jobs.
- Configure the WhatsApp gateway credentials in the deployment environment. Never expose the API key to the browser.
- Monitor failed jobs and failed delivery records; this MVP does not yet provide a retry UI or inbound webhook reconciliation.

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
