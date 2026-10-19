<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\CustomerCaptureLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerCaptureController extends Controller
{
    public function index(Request $request): Response
    {
        $links = $request->user()
            ->customerCaptureLinks()
            ->latest()
            ->get()
            ->map(fn (CustomerCaptureLink $link) => [
                'id' => $link->id,
                'name' => $link->name,
                'source' => $link->source,
                'is_active' => $link->is_active,
                'url' => route('capture.show', $link->token),
                'created_at' => $link->created_at?->toIso8601String(),
            ]);

        return Inertia::render('capture/index', ['links' => $links]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'source' => ['required', 'in:qr,nfc'],
        ]);

        $request->user()->customerCaptureLinks()->create([
            'name' => $validated['name'],
            'source' => $validated['source'],
            'token' => Str::random(48),
            'is_active' => true,
        ]);

        return to_route('capture.index')->with('success', 'Capture link created.');
    }

    public function toggle(Request $request, CustomerCaptureLink $captureLink): RedirectResponse
    {
        abort_unless($captureLink->user_id === $request->user()->id, 404);

        $captureLink->update(['is_active' => ! $captureLink->is_active]);

        return to_route('capture.index')->with('success', 'Capture link status updated.');
    }

    public function show(string $token): Response
    {
        $link = CustomerCaptureLink::query()
            ->where('token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('capture/show', [
            'campaignName' => $link->name,
            'token' => $link->token,
        ]);
    }

    public function capture(Request $request, string $token): RedirectResponse
    {
        $link = CustomerCaptureLink::query()
            ->where('token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'consent' => ['accepted'],
        ]);

        $link->user->customers()->create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'source' => Str::upper($link->source),
            'status' => 'active',
            'consent_at' => now(),
        ]);

        return to_route('capture.show', $token)
            ->with('success', 'Thank you. Your details have been submitted.');
    }
}
