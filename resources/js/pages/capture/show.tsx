import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
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

    const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#dce6f5] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-[#a2aec1] focus:border-[#70a1ff] focus:ring-4 focus:ring-[#145df5]/10';

    return (
        <>
            <Head title="Connect with us">
                <meta name="theme-color" content="#f5f8ff" />
                <meta name="description" content="Share your contact details with this business using QLayen." />
            </Head>
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8ff] px-4 py-8 sm:px-6">
                <div className="pointer-events-none absolute -top-32 -left-20 size-80 rounded-full bg-[#dbe8ff] blur-3xl" />
                <div className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-[#d9faf4] blur-3xl" />
                <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_24px_90px_rgba(25,60,117,0.12)] md:grid-cols-[.85fr_1.15fr]">
                    <aside className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#10264d] via-[#173c79] to-[#087f82] p-6 text-white sm:p-9 md:min-h-[650px] md:p-10">
                        <div className="relative z-10 inline-flex w-fit rounded-xl bg-white px-3 py-2">
                            <img src="/qlayen-logo.svg" alt="QLayen" className="w-32" />
                        </div>
                        <div className="relative z-10 py-8 md:py-12">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-extrabold tracking-[.13em] text-[#b6fff1] uppercase"><Sparkles size={13} /> A better connection starts here</span>
                            <h1 className="mt-5 max-w-sm text-3xl leading-tight font-extrabold tracking-[-.05em] sm:text-4xl">Stay connected, on your terms.</h1>
                            <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100/80">Share the details you are comfortable providing so this business can follow up with you.</p>
                            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                                <ShieldCheck className="mt-0.5 shrink-0 text-[#55e4d4]" size={20} />
                                <p className="text-xs leading-5 text-blue-50/90">Your contact details should be used responsibly. You may request access, correction, or deletion according to the business's applicable policy.</p>
                            </div>
                        </div>
                        <p className="relative z-10 text-[11px] text-blue-100/65">Powered by QLayen customer engagement</p>
                        <div className="absolute -right-24 -bottom-24 size-72 rounded-full border border-white/10 shadow-[0_0_0_35px_rgba(255,255,255,0.03),0_0_0_70px_rgba(255,255,255,0.025)]" />
                    </aside>
                    <div className="p-6 sm:p-9 md:p-10">
                        <div className="mb-7">
                            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#e5fbf8] text-[#087f82]"><MessageCircle size={23} /></div>
                            <p className="text-[10px] font-extrabold tracking-[.16em] text-[#18a99f] uppercase">Customer connection</p>
                            <h2 className="mt-2 text-2xl font-extrabold tracking-[-.045em] text-[#10264d]">Let's keep in touch</h2>
                            <p className="mt-2 text-sm leading-6 text-[#7586a0]">{campaignName} · Fill in the form below to share your contact details.</p>
                        </div>
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <label className="block text-sm font-bold text-[#263c5f]">
                                Full name <span className="text-[#d92d48]">*</span>
                                <input autoComplete="name" className={inputClass} value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} maxLength={255} placeholder="Your name" required />
                                {form.errors.name && <span className="mt-2 block text-xs font-medium text-[#d92d48]">{form.errors.name}</span>}
                            </label>
                            <label className="block text-sm font-bold text-[#263c5f]">
                                WhatsApp / phone number <span className="text-[#d92d48]">*</span>
                                <input autoComplete="tel" type="tel" className={inputClass} value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} maxLength={32} placeholder="e.g. 08xxxxxxxxxx" required />
                                {form.errors.phone && <span className="mt-2 block text-xs font-medium text-[#d92d48]">{form.errors.phone}</span>}
                            </label>
                            <label className="block text-sm font-bold text-[#263c5f]">
                                Email <span className="font-normal text-[#8494ae]">(optional)</span>
                                <input autoComplete="email" type="email" className={inputClass} value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} maxLength={255} placeholder="you@example.com" />
                                {form.errors.email && <span className="mt-2 block text-xs font-medium text-[#d92d48]">{form.errors.email}</span>}
                            </label>
                            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e0e8f5] bg-[#f8faff] p-4 text-xs leading-5 text-[#536786]">
                                <input className="mt-1 size-4 shrink-0 accent-[#145df5]" type="checkbox" checked={form.data.consent} onChange={(event) => form.setData('consent', event.target.checked)} required />
                                <span>I agree that this business may store my contact details and use them to contact me about its products, services, and relevant updates. I can request that my data be corrected or deleted.</span>
                            </label>
                            {form.errors.consent && <span className="-mt-3 text-xs font-medium text-[#d92d48]">{form.errors.consent}</span>}
                            <button type="submit" disabled={form.processing} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#145df5] px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#104fd4] disabled:cursor-not-allowed disabled:opacity-60">
                                {form.processing ? 'Submitting…' : 'Share my details'} <CheckCircle2 size={17} />
                            </button>
                        </form>
                        <p className="mt-5 text-center text-[11px] leading-5 text-[#8494ae]">Please share only information you want this business to use for follow-up. Do not submit sensitive personal information.</p>
                    </div>
                </section>
            </main>
        </>
    );
}
