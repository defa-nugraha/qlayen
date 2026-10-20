<?php

use App\Models\Customer;
use App\Models\CustomerCaptureLink;
use App\Models\CustomerFollowUpDelivery;
use App\Models\CustomerInteraction;
use App\Models\User;
use App\Models\WhatsAppWebhookEvent;
use App\Models\Workspace;
use Database\Seeders\DemoDataSeeder;

it('seeds every implemented workspace role and demo feature idempotently', function () {
    $this->seed(DemoDataSeeder::class);

    $workspace = Workspace::query()
        ->where('name', 'QLayen Demo Business')
        ->firstOrFail();

    expect(User::query()->whereIn('email', [
        'owner@qlayen.test',
        'admin@qlayen.test',
        'member@qlayen.test',
    ])->count())->toBe(3)
        ->and($workspace->members()->wherePivot('role', 'owner')->count())->toBe(1)
        ->and($workspace->members()->wherePivot('role', 'admin')->count())->toBe(1)
        ->and($workspace->members()->wherePivot('role', 'member')->count())->toBe(1)
        ->and(Customer::query()->where('workspace_id', $workspace->id)->count())->toBe(4)
        ->and(CustomerCaptureLink::query()->where('workspace_id', $workspace->id)->count())->toBe(3)
        ->and(CustomerInteraction::query()->count())->toBe(3)
        ->and(CustomerFollowUpDelivery::query()->count())->toBe(2)
        ->and(WhatsAppWebhookEvent::query()->count())->toBe(2);

    $this->seed(DemoDataSeeder::class);

    expect(User::query()->whereIn('email', [
        'owner@qlayen.test',
        'admin@qlayen.test',
        'member@qlayen.test',
    ])->count())->toBe(3)
        ->and(Workspace::query()->where('name', 'QLayen Demo Business')->count())->toBe(1)
        ->and(Customer::query()->where('workspace_id', $workspace->id)->count())->toBe(4)
        ->and(CustomerCaptureLink::query()->where('workspace_id', $workspace->id)->count())->toBe(3)
        ->and(CustomerInteraction::query()->count())->toBe(3)
        ->and(CustomerFollowUpDelivery::query()->count())->toBe(2)
        ->and(WhatsAppWebhookEvent::query()->count())->toBe(2);
});
