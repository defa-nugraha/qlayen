<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\ActivationQrCode;
use App\Models\User;
use App\Models\Workspace;
use App\Support\WorkspaceContext;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ActivationQrCodeController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $this->authorizeManager($workspace, $request);

        return Inertia::render('activation-qr-codes/index', [
            'codes' => ActivationQrCode::query()
                ->where('generated_workspace_id', $workspace->id)
                ->latest()
                ->get()
                ->map(fn (ActivationQrCode $code) => [
                    'id' => $code->id,
                    'name' => $code->name,
                    'token' => $code->token,
                    'url' => route('activation-qr.show', $code->token),
                    'foreground_color' => $code->foreground_color,
                    'background_color' => $code->background_color,
                    'frame_text' => $code->frame_text,
                    'status' => $code->status,
                    'activated_at' => $code->activated_at?->toIso8601String(),
                    'business_name' => $code->workspace?->name,
                ]),
            'workspaces' => $request->user()->workspaces()
                ->orderBy('workspaces.name')
                ->get()
                ->map(fn (Workspace $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'role' => $item->pivot->role,
                ]),
            'currentWorkspaceId' => $workspace->id,
        ]);
    }

    public function store(Request $request, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($workspace, $request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'foreground_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'frame_text' => ['required', 'string', 'max:80'],
        ]);

        ActivationQrCode::query()->create([
            'generated_by_user_id' => $request->user()->id,
            'generated_workspace_id' => $workspace->id,
            'name' => $validated['name'],
            'token' => Str::random(48),
            'foreground_color' => strtoupper($validated['foreground_color']),
            'background_color' => strtoupper($validated['background_color']),
            'frame_text' => $validated['frame_text'],
            'status' => 'pending',
        ]);

        return to_route('activation-qr.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Activation QR created. Print it and give it to the business owner.');
    }

    public function show(string $token): Response
    {
        $code = ActivationQrCode::query()->where('token', $token)->firstOrFail();

        if ($code->status === 'active') {
            if (config('qlayen.whatsapp_capture_mode', 'form') === 'webhook') {
                $template = (string) config('qlayen.whatsapp_message_template');
                $message = str_replace('{token}', $code->token, $template);
                $sender = (string) ($code->workspace?->wa_gateway_sender ?? config('services.wa_gateway.sender'));

                if ($sender !== '') {
                    return Inertia::location('https://wa.me/'.$sender.'?text='.rawurlencode($message));
                }

                abort(503, 'Nomor WhatsApp bisnis belum dikonfigurasi.');
            }

            return Inertia::render('capture/show', [
                'campaignName' => $code->name,
                'token' => $code->token,
                'submitUrl' => route('activation-qr.capture', $code->token),
            ]);
        }

        return Inertia::render('activation-qr-codes/activate', [
            'code' => [
                'name' => $code->name,
                'token' => $code->token,
                'status' => $code->status,
                'foreground_color' => $code->foreground_color,
                'background_color' => $code->background_color,
                'frame_text' => $code->frame_text,
            ],
        ]);
    }

    public function activate(Request $request, string $token): RedirectResponse
    {
        $validated = $request->validate([
            'owner_name' => ['required', 'string', 'max:255'],
            'business_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', 'min:12'],
        ]);

        $user = DB::transaction(function () use ($validated, $token): User {
            $code = ActivationQrCode::query()->where('token', $token)->lockForUpdate()->firstOrFail();
            abort_unless($code->status === 'pending', 409, 'This activation QR is no longer available.');

            $user = User::query()->create([
                'name' => $validated['owner_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $workspace = $user->ownedWorkspaces()->create([
                'name' => $validated['business_name'],
                'description' => 'Created during QR activation.',
            ]);
            $workspace->members()->attach($user->id, ['role' => 'owner']);

            $code->update([
                'workspace_id' => $workspace->id,
                'activated_by_user_id' => $user->id,
                'status' => 'active',
                'activated_at' => now(),
            ]);

            return $user;
        });

        Auth::login($user);
        event(new Registered($user));

        return to_route('verification.notice')
            ->with('success', 'QR activated. Verify your email to continue setting up your business.');
    }

    public function capture(Request $request, string $token): RedirectResponse
    {
        $code = ActivationQrCode::query()
            ->where('token', $token)
            ->where('status', 'active')
            ->firstOrFail();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'consent' => ['accepted'],
        ]);

        $workspace = $code->workspace()->firstOrFail();
        $phone = preg_replace('/\D+/', '', $validated['phone']) ?? $validated['phone'];
        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        $customer = $workspace->customers()->where('phone', $phone)->first();
        if ($customer === null) {
            $workspace->customers()->create([
                'user_id' => $code->activated_by_user_id,
                'name' => $validated['name'],
                'phone' => $phone,
                'email' => $validated['email'] ?? null,
                'source' => 'QR',
                'status' => 'active',
                'consent_at' => now(),
            ]);
        } else {
            $customer->update([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? $customer->email,
                'consent_at' => now(),
            ]);
        }

        return to_route('activation-qr.show', $token)
            ->with('success', 'Thank you. Your details have been submitted.');
    }

    public function toggle(Request $request, int $activationQrCode, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($workspace, $request);
        $code = ActivationQrCode::query()
            ->where('generated_workspace_id', $workspace->id)
            ->findOrFail($activationQrCode);

        abort_if($code->status === 'active', 422, 'An activated QR cannot be disabled here.');

        $code->update(['status' => $code->status === 'disabled' ? 'pending' : 'disabled']);

        return to_route('activation-qr.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Activation QR status updated.');
    }

    private function authorizeManager(Workspace $workspace, Request $request): void
    {
        $membership = $request->user()->workspaces()->whereKey($workspace->id)->first();
        abort_unless($membership !== null && in_array($membership->pivot->role, ['owner', 'admin'], true), 403);
    }
}
