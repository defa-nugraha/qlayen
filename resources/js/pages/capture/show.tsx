import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Props = {
    campaignName: string;
    token: string;
};

export default function CaptureShow({ campaignName, token }: Props) {
    const form = useForm({
        name: '',
        phone: '',
        email: '',
        consent: false,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/c/' + token);
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

    return (
        <>
            <Head title="Customer registration" />
            <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
                <section className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-sm md:p-8">
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-primary">
                            QLayen
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                            Stay connected
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {campaignName} · Share your contact details so the
                            business can follow up with you.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-4"
                    >
                        <label className="block text-sm font-medium">
                            Full name *
                            <input
                                autoComplete="name"
                                className={inputClass}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                maxLength={255}
                                required
                            />
                            {form.errors.name && (
                                <span className="text-sm text-destructive">
                                    {form.errors.name}
                                </span>
                            )}
                        </label>
                        <label className="block text-sm font-medium">
                            WhatsApp / phone number *
                            <input
                                autoComplete="tel"
                                type="tel"
                                className={inputClass}
                                value={form.data.phone}
                                onChange={(event) =>
                                    form.setData('phone', event.target.value)
                                }
                                maxLength={32}
                                required
                            />
                            {form.errors.phone && (
                                <span className="text-sm text-destructive">
                                    {form.errors.phone}
                                </span>
                            )}
                        </label>
                        <label className="block text-sm font-medium">
                            Email (optional)
                            <input
                                autoComplete="email"
                                type="email"
                                className={inputClass}
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                maxLength={255}
                            />
                            {form.errors.email && (
                                <span className="text-sm text-destructive">
                                    {form.errors.email}
                                </span>
                            )}
                        </label>
                        <label className="flex items-start gap-3 text-sm">
                            <input
                                className="mt-1"
                                type="checkbox"
                                checked={form.data.consent}
                                onChange={(event) =>
                                    form.setData(
                                        'consent',
                                        event.target.checked,
                                    )
                                }
                                required
                            />
                            <span>
                                I agree that this business may store my contact
                                details and use them to contact me about its
                                products, services, and relevant updates. I can
                                request that my data be corrected or deleted.
                            </span>
                        </label>
                        {form.errors.consent && (
                            <span className="text-sm text-destructive">
                                {form.errors.consent}
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                            {form.processing
                                ? 'Submitting…'
                                : 'Submit details'}
                        </button>
                    </form>

                    <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                        Please share only details you want this business to use
                        for follow-up. Do not submit sensitive personal
                        information.
                    </p>
                </section>
            </main>
        </>
    );
}
