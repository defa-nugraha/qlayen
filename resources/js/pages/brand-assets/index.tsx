import { Head, router, useForm } from '@inertiajs/react';
import { ImagePlus, RotateCcw, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type Placement = {
    key: string;
    label: string;
    url: string | null;
    alt_text: string;
    updated_at: string | null;
};

type WorkspaceOption = { id: number; name: string; role: string };

function LogoCard({
    placement,
    workspaceId,
}: {
    placement: Placement;
    workspaceId: number;
}) {
    const form = useForm({
        key: placement.key,
        logo: null as File | null,
        alt_text: placement.alt_text,
        workspace_id: workspaceId,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/brand-assets', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset('logo'),
        });
    }

    function removeLogo() {
        router.delete(
            `/brand-assets/${placement.key}?workspace_id=${workspaceId}`,
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <article className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-5">
            <div>
                <h2 className="font-semibold">{placement.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {placement.url
                        ? 'Logo kustom sedang digunakan.'
                        : 'Belum ada logo kustom. Logo bawaan akan digunakan.'}
                </p>
            </div>

            <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4">
                {placement.url ? (
                    <img
                        src={placement.url}
                        alt={placement.alt_text || placement.label}
                        className="max-h-24 max-w-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus className="size-8" aria-hidden="true" />
                        <span className="text-xs">Pratinjau logo</span>
                    </div>
                )}
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-2">
                    <label
                        htmlFor={`logo-${placement.key}`}
                        className="text-sm font-medium"
                    >
                        File logo
                    </label>
                    <input
                        id={`logo-${placement.key}`}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            form.setData(
                                'logo',
                                event.target.files?.[0] ?? null,
                            )
                        }
                        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP, atau ICO. Maksimal 2 MB.
                    </p>
                    {form.errors.logo && (
                        <p role="alert" className="text-sm text-destructive">
                            {form.errors.logo}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <label
                        htmlFor={`alt-${placement.key}`}
                        className="text-sm font-medium"
                    >
                        Teks alternatif (aksesibilitas)
                    </label>
                    <input
                        id={`alt-${placement.key}`}
                        value={form.data.alt_text}
                        onChange={(event) =>
                            form.setData('alt_text', event.target.value)
                        }
                        maxLength={160}
                        placeholder="Logo QLayen"
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    />
                    {form.errors.alt_text && (
                        <p role="alert" className="text-sm text-destructive">
                            {form.errors.alt_text}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.logo}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                        <Upload className="size-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan...' : 'Simpan logo'}
                    </button>
                    {placement.url && (
                        <button
                            type="button"
                            onClick={removeLogo}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium text-destructive hover:bg-destructive/5"
                        >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Hapus
                        </button>
                    )}
                </div>
            </form>
            {placement.updated_at && (
                <p className="text-xs text-muted-foreground">
                    Terakhir diperbarui:{' '}
                    {new Date(placement.updated_at).toLocaleString('id-ID')}
                </p>
            )}
        </article>
    );
}

export default function BrandAssetsIndex({
    placements,
    workspaces,
    currentWorkspaceId,
}: {
    placements: Placement[];
    workspaces: WorkspaceOption[];
    currentWorkspaceId: number;
}) {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Kelola Logo', href: '/brand-assets' }]}
        >
            <Head title="Kelola Logo" />
            <div className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Kelola Logo
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Atur logo untuk topbar dan footer publik, sidebar
                            admin, serta halaman masuk. Perubahan berlaku untuk
                            seluruh aplikasi.
                        </p>
                    </div>
                    {workspaces.length > 1 && (
                        <label className="grid gap-1 text-sm font-medium">
                            Workspace
                            <select
                                value={currentWorkspaceId}
                                onChange={(event) =>
                                    router.get(
                                        '/brand-assets',
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
                                className="h-10 rounded-md border border-input bg-background px-3"
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
                    )}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    {placements.map((placement) => (
                        <LogoCard
                            key={placement.key}
                            placement={placement}
                            workspaceId={currentWorkspaceId}
                        />
                    ))}
                </div>

                <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                    <RotateCcw
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                    />
                    <p>
                        Logo hanya menerima format gambar umum untuk mengurangi
                        risiko file aktif. Menghapus logo kustom mengembalikan
                        tampilan ke logo bawaan aplikasi.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
