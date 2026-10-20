import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type ActivationCode = {
    name: string;
    token: string;
    status: 'pending' | 'active' | 'disabled';
    foreground_color: string;
    background_color: string;
    frame_text: string;
};

export default function ActivateBusinessQr({ code }: { code: ActivationCode }) {
    const form = useForm({
        owner_name: '',
        business_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/activate/' + code.token, { onFinish: () => form.reset('password', 'password_confirmation') });
    }

    const inputClass = 'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

    return (
        <>
            <Head title="Activate your QLayen QR" />
            <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
                <section className="w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="p-6 md:p-8" style={{ backgroundColor: code.background_color, color: code.foreground_color }}>
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">QLayen Business Activation</p>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight">{code.name}</h1>
                        <p className="mt-2 text-sm opacity-80">{code.frame_text}</p>
                    </div>
                    <div className="p-6 md:p-8">
                        {code.status !== 'pending' ? (
                            <div className="rounded-xl border p-4">
                                <h2 className="font-semibold">{code.status === 'active' ? 'QR already activated' : 'QR activation unavailable'}</h2>
                                <p className="mt-2 text-sm text-muted-foreground">{code.status === 'active' ? 'This QR is ready to collect customer contact details. Scan it again to open the customer form.' : 'This QR has been disabled. Please contact the QLayen administrator.'}</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold">Register your business</h2>
                                <p className="mt-2 text-sm text-muted-foreground">Create your QLayen account. When registration succeeds, this QR will be permanently linked to your new business workspace.</p>
                                <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                                    <label className="text-sm font-medium">Owner full name
                                        <input autoComplete="name" className={inputClass} value={form.data.owner_name} onChange={(event) => form.setData('owner_name', event.target.value)} maxLength={255} required />
                                        {form.errors.owner_name && <span className="text-sm text-destructive">{form.errors.owner_name}</span>}
                                    </label>
                                    <label className="text-sm font-medium">Business name
                                        <input autoComplete="organization" className={inputClass} value={form.data.business_name} onChange={(event) => form.setData('business_name', event.target.value)} maxLength={120} required placeholder="e.g. Kopi Nusantara" />
                                        {form.errors.business_name && <span className="text-sm text-destructive">{form.errors.business_name}</span>}
                                    </label>
                                    <label className="text-sm font-medium">Business owner email
                                        <input autoComplete="email" type="email" className={inputClass} value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} maxLength={255} required />
                                        {form.errors.email && <span className="text-sm text-destructive">{form.errors.email}</span>}
                                    </label>
                                    <label className="text-sm font-medium">Password (minimum 12 characters)
                                        <input autoComplete="new-password" type="password" className={inputClass} value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} minLength={12} required />
                                        {form.errors.password && <span className="text-sm text-destructive">{form.errors.password}</span>}
                                    </label>
                                    <label className="text-sm font-medium">Confirm password
                                        <input autoComplete="new-password" type="password" className={inputClass} value={form.data.password_confirmation} onChange={(event) => form.setData('password_confirmation', event.target.value)} minLength={12} required />
                                    </label>
                                    <button type="submit" disabled={form.processing} className="mt-2 min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{form.processing ? 'Activating…' : 'Create account & activate QR'}</button>
                                    <p className="text-xs leading-relaxed text-muted-foreground">You will need to verify your email before accessing your dashboard. Each activation QR can only be claimed once.</p>
                                </form>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
