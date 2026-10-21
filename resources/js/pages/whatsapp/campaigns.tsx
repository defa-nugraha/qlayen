import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type WorkspaceOption = { id: number; name: string; role: string };

export default function WhatsAppCampaigns({
    workspaces,
    currentWorkspaceId,
    eligibleCount,
    configured,
}: {
    workspaces: WorkspaceOption[];
    currentWorkspaceId: number;
    eligibleCount: number;
    configured: boolean;
}) {
    const form = useForm({
        workspace_id: currentWorkspaceId,
        name: '',
        message: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (
            !window.confirm(
                'Kirim kampanye ke ' +
                    eligibleCount +
                    ' kontak yang telah memberikan persetujuan WhatsApp?',
            )
        ) {
            return;
        }

        form.post('/whatsapp/campaigns', {
            onSuccess: () => form.reset('name', 'message'),
        });
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'WhatsApp Campaigns', href: '/whatsapp/campaigns' },
            ]}
        >
            <Head title="WhatsApp Campaigns" />
            <div className="flex flex-col gap-6 p-4 md:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            WhatsApp campaigns
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Buat pesan kampanye dan masukkan pengiriman ke
                            antrean. Hanya kontak aktif dengan persetujuan
                            WhatsApp yang akan menjadi penerima.
                        </p>
                    </div>
                    <label className="text-sm font-medium">
                        Workspace
                        <select
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 sm:min-w-56"
                            value={currentWorkspaceId}
                            onChange={(event) =>
                                router.get(
                                    '/whatsapp/campaigns',
                                    {
                                        workspace_id: Number(
                                            event.target.value,
                                        ),
                                    },
                                    {
                                        preserveState: false,
                                        replace: true,
                                    },
                                )
                            }
                        >
                            {workspaces.map((workspace) => (
                                <option
                                    key={workspace.id}
                                    value={workspace.id}
                                >
                                    {workspace.name} ({workspace.role})
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            Eligible recipients
                        </p>
                        <p className="mt-1 text-3xl font-semibold">
                            {eligibleCount}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Kontak aktif, nomor tersedia, dan persetujuan
                            tercatat.
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            Gateway configuration
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {configured ? 'Configured' : 'Not configured'}
                        </p>
                        <a
                            className="mt-2 inline-block text-sm underline"
                            href="/whatsapp/settings"
                        >
                            Buka pengaturan WhatsApp
                        </a>
                    </div>
                </div>

                <section className="rounded-xl border bg-card p-4 md:p-6">
                    <h2 className="text-lg font-semibold">Buat kampanye</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pastikan isi pesan relevan, identitas bisnis jelas, dan
                        penerima memang mengharapkan komunikasi. Pengiriman
                        aktual memerlukan queue worker aktif.
                    </p>
                    <form
                        onSubmit={submit}
                        className="mt-5 flex flex-col gap-4"
                    >
                        <label className="text-sm font-medium">
                            Nama kampanye
                            <input
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                                maxLength={120}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                                placeholder="Contoh: Promo pelanggan Oktober"
                            />
                            {form.errors.name && (
                                <span className="text-sm text-destructive">
                                    {form.errors.name}
                                </span>
                            )}
                        </label>
                        <label className="text-sm font-medium">
                            Isi pesan
                            <textarea
                                className="mt-1 min-h-36 w-full rounded-md border border-input bg-background px-3 py-2"
                                maxLength={4096}
                                value={form.data.message}
                                onChange={(event) =>
                                    form.setData('message', event.target.value)
                                }
                                required
                                placeholder="Halo! Ada informasi terbaru dari kami…"
                            />
                            <span className="mt-1 block text-xs text-muted-foreground">
                                {form.data.message.length}/4096 karakter
                            </span>
                            {form.errors.message && (
                                <span className="text-sm text-destructive">
                                    {form.errors.message}
                                </span>
                            )}
                        </label>
                        <button
                            type="submit"
                            disabled={
                                form.processing || !configured || eligibleCount === 0
                            }
                            className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        >
                            {form.processing
                                ? 'Memasukkan ke antrean…'
                                : 'Antrekan kampanye'}
                        </button>
                        {!configured && (
                            <p className="text-sm text-destructive">
                                Lengkapi API key dan nomor pengirim pada
                                pengaturan WhatsApp terlebih dahulu.
                            </p>
                        )}
                    </form>
                </section>
            </div>
        </AppLayout>
    );
}
