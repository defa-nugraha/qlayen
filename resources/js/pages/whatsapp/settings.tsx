import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

type WorkspaceOption = { id: number; name: string; role: string };
type GatewayState = { status: string; message?: string; qrcode?: string };

export default function WhatsAppSettings({
    workspaces,
    currentWorkspaceId,
    sender,
    hasApiKey,
    gatewayUrl,
}: {
    workspaces: WorkspaceOption[];
    currentWorkspaceId: number;
    sender: string | null;
    hasApiKey: boolean;
    gatewayUrl: string;
}) {
    const form = useForm({ workspace_id: currentWorkspaceId, api_key: '', sender: sender ?? '' });
    const [gateway, setGateway] = useState<GatewayState | null>(null);
    const [testNumber, setTestNumber] = useState('');
    const [busy, setBusy] = useState(false);
    const [testMessage, setTestMessage] = useState('');
    const polling = useRef(false);

    function csrfToken() {
        const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='));
        return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : '';
    }

    async function requestQr() {
        setBusy(true);
        polling.current = true;
        setGateway({ status: 'processing', message: 'Meminta QR dari gateway…' });
        const started = Date.now();
        try {
            while (polling.current && Date.now() - started < 90000) {
                const response = await fetch('/whatsapp/qr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': csrfToken() },
                    body: JSON.stringify({ workspace_id: currentWorkspaceId }),
                });
                const data = (await response.json()) as GatewayState;
                setGateway(data);
                if (!response.ok || ['connected', 'qr', 'error'].includes(data.status)) {
                    if (data.status !== 'qr') break;
                }
                if (data.status === 'qr') {
                    // Poll again after the user scans the QR to detect "Device already connected".
                    await new Promise((resolve) => window.setTimeout(resolve, 6500));
                    continue;
                }
                if (data.status !== 'processing' && data.status !== 'waiting') break;
                await new Promise((resolve) => window.setTimeout(resolve, 6500));
            }
            if (polling.current && Date.now() - started >= 90000) {
                setGateway((current) => current?.status === 'connected' ? current : { status: 'timeout', message: 'Waktu tunggu habis. Coba minta QR baru.' });
            }
        } catch {
            setGateway({ status: 'error', message: 'Tidak dapat menghubungi server QLayen.' });
        } finally {
            setBusy(false);
            polling.current = false;
        }
    }

    function stopPolling() {
        polling.current = false;
        setBusy(false);
    }

    async function sendTest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setTestMessage('Mengirim pesan tes…');
                try {
            const response = await fetch('/whatsapp/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ workspace_id: currentWorkspaceId, number: testNumber }),
            });
            const data = (await response.json()) as GatewayState;
            setTestMessage(data.message ?? (response.ok ? 'Selesai.' : 'Pengiriman gagal.'));
        } catch {
            setTestMessage('Tidak dapat menghubungi server QLayen.');
        }
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'WhatsApp Gateway', href: '/whatsapp/settings' }]}>
            <Head title="WhatsApp Gateway" />
            <div className="flex flex-col gap-6 p-4 md:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Gateway</h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Kelola kredensial perangkat, hubungkan WhatsApp melalui QR, dan kirim pesan tes sebelum demo.</p>
                    </div>
                    <label className="text-sm font-medium">Workspace
                        <select className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 sm:min-w-56" value={currentWorkspaceId}
                            onChange={(event) => router.get('/whatsapp/settings', { workspace_id: Number(event.target.value) }, { preserveState: false, replace: true })}>
                            {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name} ({workspace.role})</option>)}
                        </select>
                    </label>
                </div>

                <section className="rounded-xl border bg-card p-4 md:p-6">
                    <h2 className="text-lg font-semibold">1. Konfigurasi perangkat</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Gateway: {gatewayUrl}. API key disimpan terenkripsi dan tidak ditampilkan kembali setelah disimpan.</p>
                    <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); form.put('/whatsapp/settings', { onSuccess: () => form.setData('api_key', '') }); }}>
                        <input type="hidden" value={currentWorkspaceId} readOnly />
                        <label className="text-sm font-medium">API key {hasApiKey ? '(sudah tersimpan; isi hanya jika ingin mengganti)' : ''}
                            <input type="password" autoComplete="new-password" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.data.api_key} onChange={(event) => form.setData('api_key', event.target.value)} placeholder={hasApiKey ? '••••••••••••••••' : 'Masukkan API key gateway'} />
                            {form.errors.api_key && <span className="text-sm text-destructive">{form.errors.api_key}</span>}
                        </label>
                        <label className="text-sm font-medium">Nomor perangkat pengirim (format internasional, angka saja)
                            <input inputMode="numeric" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.data.sender} onChange={(event) => form.setData('sender', event.target.value.replace(/\D/g, ''))} placeholder="6281234567890" required />
                            {form.errors.sender && <span className="text-sm text-destructive">{form.errors.sender}</span>}
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{form.processing ? 'Menyimpan…' : 'Simpan pengaturan'}</button>
                            <span className="self-center text-xs text-muted-foreground">{hasApiKey ? 'API key sudah dikonfigurasi.' : 'API key belum dikonfigurasi.'}</span>
                        </div>
                    </form>
                </section>

                <section className="rounded-xl border bg-card p-4 md:p-6">
                    <h2 className="text-lg font-semibold">2. Hubungkan WhatsApp dengan QR</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Simpan konfigurasi dahulu. Buka WhatsApp di ponsel, pilih Perangkat tertaut, lalu tautkan perangkat. QR akan diminta ulang secara berkala sesuai respons gateway.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" disabled={busy || !hasApiKey || !sender} onClick={requestQr} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? 'Menunggu respons gateway…' : 'Tampilkan / perbarui QR'}</button>
                        {busy && <button type="button" onClick={stopPolling} className="rounded-lg border px-4 py-2 text-sm">Hentikan</button>}
                    </div>
                    {gateway && <div className="mt-4 flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row">
                        {gateway.qrcode && <img src={gateway.qrcode} alt="QR untuk menghubungkan WhatsApp" className="h-64 w-64 rounded bg-white object-contain p-2" />}
                        <div><p className="font-medium">{gateway.status === 'connected' ? 'WhatsApp terhubung menurut respons gateway' : gateway.status === 'qr' ? 'Pindai QR sekarang' : gateway.status === 'error' ? 'Terjadi kesalahan' : 'Status: ' + gateway.status}</p><p className="mt-1 text-sm text-muted-foreground">{gateway.message}</p></div>
                    </div>}
                    <p className="mt-3 text-xs text-muted-foreground">Status terhubung hanya dikenali jika gateway mengembalikan respons “Device already connected!”. QR yang tampil saja belum membuktikan koneksi berhasil.</p>
                </section>

                <section className="rounded-xl border bg-card p-4 md:p-6">
                    <h2 className="text-lg font-semibold">3. Kirim pesan tes</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Gunakan nomor milik Anda sendiri dalam format internasional tanpa tanda + atau spasi.</p>
                    <form onSubmit={sendTest} className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input inputMode="numeric" className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2" value={testNumber} onChange={(event) => setTestNumber(event.target.value.replace(/\D/g, ''))} placeholder="6281234567890" required />
                        <button type="submit" disabled={!hasApiKey || !sender} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Kirim pesan tes</button>
                    </form>
                    {testMessage && <p role="status" className="mt-3 text-sm">{testMessage}</p>}
                </section>
            </div>
        </AppLayout>
    );
}
