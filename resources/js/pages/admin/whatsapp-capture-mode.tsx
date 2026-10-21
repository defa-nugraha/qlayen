import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function WhatsAppCaptureMode({
    mode,
    webhookUrl,
    webhookSecretConfigured,
    template,
}: {
    mode: 'form' | 'webhook';
    webhookUrl: string;
    webhookSecretConfigured: boolean;
    template: string;
}) {
    const form = useForm({ mode, message_template: template });

    return (
        <AppLayout breadcrumbs={[{ title: 'Mode Pengumpulan Kontak', href: '/admin/whatsapp-capture-mode' }]}>
            <Head title="Mode Pengumpulan Kontak WhatsApp" />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">Mode Pengumpulan Kontak WhatsApp</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Pengaturan global ini hanya dapat diubah oleh admin aplikasi QLayen.</p>
                </header>
                <form onSubmit={(event) => { event.preventDefault(); form.put('/admin/whatsapp-capture-mode'); }} className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
                    <fieldset className="grid gap-3">
                        <legend className="text-base font-semibold">Pilih mode</legend>
                        <label className="flex cursor-pointer gap-3 rounded-xl border p-4">
                            <input type="radio" name="mode" value="form" checked={form.data.mode === 'form'} onChange={() => form.setData('mode', 'form')} className="mt-1" />
                            <span><span className="block font-medium">Formulir (mode saat ini)</span><span className="mt-1 block text-sm text-muted-foreground">Pelanggan mengisi nama, nomor telepon, email opsional, dan persetujuan melalui halaman QLayen.</span></span>
                        </label>
                        <label className="flex cursor-pointer gap-3 rounded-xl border p-4">
                            <input type="radio" name="mode" value="webhook" checked={form.data.mode === 'webhook'} onChange={() => form.setData('mode', 'webhook')} className="mt-1" />
                            <span><span className="block font-medium">WhatsApp Webhook</span><span className="mt-1 block text-sm text-muted-foreground">Pelanggan diarahkan ke WhatsApp dengan pesan siap kirim. Nomor dicatat setelah gateway mengirim callback pesan masuk.</span></span>
                        </label>
                    </fieldset>
                    <label className="text-sm font-medium">
                        Template pesan
                        <textarea value={form.data.message_template} onChange={(event) => form.setData('message_template', event.target.value)} rows={4} maxLength={1000} required className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 font-normal" />
                        <span className="mt-1 block text-xs text-muted-foreground">Gunakan {'{token}'} untuk menyertakan referensi QR unik. Jangan hapus penanda ini apabila memakai mode webhook.</span>
                        {form.errors.message_template && <span className="text-sm text-destructive">{form.errors.message_template}</span>}
                    </label>
                    <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                        <p className="font-semibold">Konfigurasi webhook WA Gateway</p>
                        <p className="mt-1 break-all">URL callback: {webhookUrl}</p>
                        <p className="mt-1">Secret webhook: {webhookSecretConfigured ? 'sudah dikonfigurasi' : 'belum dikonfigurasi'}</p>
                        <p className="mt-2 text-muted-foreground">Setel WA_GATEWAY_WEBHOOK_SECRET pada environment server dan kirim secret melalui header X-QLayen-Webhook-Secret (atau field webhook_secret) ke URL di atas.</p>
                    </div>
                    {form.errors.mode && <p className="text-sm text-destructive">{form.errors.mode}</p>}
                    <div><button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{form.processing ? 'Menyimpan…' : 'Simpan mode'}</button></div>
                </form>
            </div>
        </AppLayout>
    );
}
