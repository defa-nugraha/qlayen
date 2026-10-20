<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\CustomerCaptureLink;
use App\Models\CustomerFollowUpDelivery;
use App\Models\CustomerInteraction;
use App\Models\User;
use App\Models\WhatsAppWebhookEvent;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed deterministic demo records for implemented workspace roles and features.
     *
     * This seeder is intentionally restricted to local/testing environments unless
     * QLAYEN_SEED_DEMO=true is explicitly set.
     */
    public function run(): void
    {
        if (app()->environment('production') && config('qlayen.seed_demo') !== true) {
            $this->command->warn('Demo data skipped in production. Set QLAYEN_SEED_DEMO=true only for an intentional demo environment.');

            return;
        }

        $password = (string) config('qlayen.demo_password', 'password');

        $owner = $this->user('owner@qlayen.test', 'QLayen Demo Owner', $password);
        $admin = $this->user('admin@qlayen.test', 'QLayen Demo Admin', $password);
        $member = $this->user('member@qlayen.test', 'QLayen Demo Member', $password);

        $workspace = Workspace::query()->updateOrCreate(
            ['owner_id' => $owner->id, 'name' => 'QLayen Demo Business'],
            ['description' => 'Demo workspace for validating QLayen MVP features.']
        );

        $workspace->members()->syncWithoutDetaching([
            $owner->id => ['role' => 'owner'],
            $admin->id => ['role' => 'admin'],
            $member->id => ['role' => 'member'],
        ]);

        $customers = $this->seedCustomers($workspace, $owner);
        $this->seedCaptureLinks($workspace, $owner);
        $this->seedInteractions($customers, $owner, $member);
        $deliveries = $this->seedFollowUpDeliveries($workspace, $customers);
        $this->seedWebhookEvents($deliveries);

        $this->command->info('QLayen demo data seeded: owner/admin/member, workspace, customers, QR/NFC links, interactions, follow-ups, WhatsApp deliveries and webhook events.');
    }

    private function user(string $email, string $name, string $password): User
    {
        $user = User::query()->firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->password = Hash::make($password);
        $user->email_verified_at = $user->email_verified_at ?? Carbon::now();
        $user->save();

        return $user;
    }

    /**
     * @return array<string, Customer>
     */
    private function seedCustomers(Workspace $workspace, User $owner): array
    {
        $definitions = [
            'repeat-customer@qlayen.test' => [
                'name' => 'Alya Putri',
                'phone' => '628111000001',
                'source' => 'qr',
                'status' => 'active',
                'notes' => 'Demo customer with interaction history and read WhatsApp delivery.',
                'follow_up_at' => Carbon::parse('2026-10-15 09:00:00'),
                'follow_up_notes' => 'Ask for feedback after the previous visit.',
                'follow_up_whatsapp_enabled' => true,
                'whatsapp_consent_at' => Carbon::parse('2026-10-10 10:00:00'),
                'consent_at' => Carbon::parse('2026-10-10 10:00:00'),
            ],
            'new-customer@qlayen.test' => [
                'name' => 'Bima Pratama',
                'phone' => '628111000002',
                'source' => 'nfc',
                'status' => 'active',
                'notes' => 'Demo customer captured from an NFC entry point.',
                'follow_up_at' => Carbon::parse('2026-10-25 09:00:00'),
                'follow_up_notes' => 'Check whether assistance is needed.',
                'follow_up_whatsapp_enabled' => false,
                'whatsapp_consent_at' => null,
                'consent_at' => Carbon::parse('2026-10-18 10:00:00'),
            ],
            'inactive-customer@qlayen.test' => [
                'name' => 'Citra Maharani',
                'phone' => '628111000003',
                'source' => 'manual',
                'status' => 'inactive',
                'notes' => 'Demo inactive customer for CRM filtering.',
                'follow_up_at' => Carbon::parse('2026-10-12 09:00:00'),
                'follow_up_notes' => 'No further follow-up while inactive.',
                'follow_up_whatsapp_enabled' => false,
                'whatsapp_consent_at' => null,
                'consent_at' => null,
            ],
            'pending-follow-up@qlayen.test' => [
                'name' => 'Dimas Saputra',
                'phone' => '628111000004',
                'source' => 'manual',
                'status' => 'active',
                'notes' => 'Demo customer for pending manual follow-up.',
                'follow_up_at' => Carbon::parse('2026-10-25 14:00:00'),
                'follow_up_notes' => 'Follow up on the service inquiry.',
                'follow_up_whatsapp_enabled' => false,
                'whatsapp_consent_at' => null,
                'consent_at' => Carbon::parse('2026-10-19 10:00:00'),
            ],
        ];

        $customers = [];

        foreach ($definitions as $email => $attributes) {
            $customer = Customer::query()->updateOrCreate(
                ['workspace_id' => $workspace->id, 'email' => $email],
                [
                    'user_id' => $owner->id,
                    ...$attributes,
                ]
            );

            $customers[$email] = $customer;
        }

        return $customers;
    }

    private function seedCaptureLinks(Workspace $workspace, User $owner): void
    {
        foreach ([
            ['name' => 'Demo QR - Front Desk', 'token' => 'qlayen-demo-qr-front-desk', 'source' => 'qr', 'is_active' => true],
            ['name' => 'Demo NFC - Reception', 'token' => 'qlayen-demo-nfc-reception', 'source' => 'nfc', 'is_active' => true],
            ['name' => 'Demo QR - Disabled Campaign', 'token' => 'qlayen-demo-qr-disabled', 'source' => 'qr', 'is_active' => false],
        ] as $link) {
            CustomerCaptureLink::query()->updateOrCreate(
                ['token' => $link['token']],
                [
                    'user_id' => $owner->id,
                    'workspace_id' => $workspace->id,
                    ...$link,
                ]
            );
        }
    }

    /**
     * @param  array<string, Customer>  $customers
     */
    private function seedInteractions(array $customers, User $owner, User $member): void
    {
        $definitions = [
            [
                'customer' => 'repeat-customer@qlayen.test',
                'user' => $member,
                'type' => 'visit',
                'summary' => 'Customer visited the business',
                'details' => 'Demo visit interaction for the customer timeline.',
                'occurred_at' => Carbon::parse('2026-10-11 10:00:00'),
            ],
            [
                'customer' => 'repeat-customer@qlayen.test',
                'user' => $owner,
                'type' => 'message',
                'summary' => 'Feedback request recorded',
                'details' => 'A follow-up message was recorded; this entry is not proof of delivery by itself.',
                'occurred_at' => Carbon::parse('2026-10-12 11:00:00'),
            ],
            [
                'customer' => 'new-customer@qlayen.test',
                'user' => $member,
                'type' => 'note',
                'summary' => 'Customer asked about available services',
                'details' => 'Demo note entered by a workspace member.',
                'occurred_at' => Carbon::parse('2026-10-18 13:00:00'),
            ],
        ];

        foreach ($definitions as $definition) {
            $customer = $customers[$definition['customer']];
            CustomerInteraction::query()->updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'type' => $definition['type'],
                    'summary' => $definition['summary'],
                ],
                [
                    'user_id' => $definition['user']->id,
                    'details' => $definition['details'],
                    'occurred_at' => $definition['occurred_at'],
                ]
            );
        }
    }

    /**
     * @param  array<string, Customer>  $customers
     * @return array<string, CustomerFollowUpDelivery>
     */
    private function seedFollowUpDeliveries(Workspace $workspace, array $customers): array
    {
        $definitions = [
            'accepted' => [
                'customer' => 'repeat-customer@qlayen.test',
                'scheduled_for' => Carbon::parse('2026-10-15 09:00:00'),
                'status' => 'read',
                'attempts' => 1,
                'accepted_at' => Carbon::parse('2026-10-15 09:01:00'),
                'provider_response' => ['status' => true, 'message' => 'Demo provider accepted the message.'],
                'last_error' => null,
                'provider_message_id' => 'demo-provider-message-read',
                'delivered_at' => Carbon::parse('2026-10-15 09:02:00'),
                'read_at' => Carbon::parse('2026-10-15 09:03:00'),
            ],
            'failed' => [
                'customer' => 'inactive-customer@qlayen.test',
                'scheduled_for' => Carbon::parse('2026-10-12 09:00:00'),
                'status' => 'failed',
                'attempts' => 3,
                'accepted_at' => null,
                'provider_response' => null,
                'last_error' => 'Demo failure record; no real message was sent.',
                'provider_message_id' => null,
                'delivered_at' => null,
                'read_at' => null,
            ],
        ];

        $deliveries = [];

        foreach ($definitions as $key => $definition) {
            $customer = $customers[$definition['customer']];
            $delivery = CustomerFollowUpDelivery::query()->updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'scheduled_for' => $definition['scheduled_for'],
                ],
                [
                    'workspace_id' => $workspace->id,
                    'status' => $definition['status'],
                    'attempts' => $definition['attempts'],
                    'accepted_at' => $definition['accepted_at'],
                    'provider_response' => $definition['provider_response'],
                    'last_error' => $definition['last_error'],
                ]
            );

            $delivery->forceFill([
                'provider_message_id' => $definition['provider_message_id'],
                'delivered_at' => $definition['delivered_at'],
                'read_at' => $definition['read_at'],
            ])->save();

            $deliveries[$key] = $delivery;
        }

        return $deliveries;
    }

    /**
     * @param  array<string, CustomerFollowUpDelivery>  $deliveries
     */
    private function seedWebhookEvents(array $deliveries): void
    {
        $delivery = $deliveries['accepted'];

        foreach ([
            [
                'event_id' => 'qlayen-demo-event-delivered',
                'event_status' => 'delivered',
                'payload' => [
                    'event_id' => 'qlayen-demo-event-delivered',
                    'delivery_id' => $delivery->id,
                    'status' => 'delivered',
                    'provider_message_id' => 'demo-provider-message-read',
                ],
            ],
            [
                'event_id' => 'qlayen-demo-event-read',
                'event_status' => 'read',
                'payload' => [
                    'event_id' => 'qlayen-demo-event-read',
                    'delivery_id' => $delivery->id,
                    'status' => 'read',
                    'provider_message_id' => 'demo-provider-message-read',
                ],
            ],
        ] as $event) {
            WhatsAppWebhookEvent::query()->updateOrCreate(
                ['event_id' => $event['event_id']],
                [
                    'delivery_id' => $delivery->id,
                    'event_status' => $event['event_status'],
                    'payload' => $event['payload'],
                ]
            );
        }
    }
}
