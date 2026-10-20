import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Check,
    ContactRound,
    MessageCircle,
    QrCode,
    ShieldCheck,
    Sparkles,
    UsersRound,
    Workflow,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: ContactRound,
        title: 'Customer profiles, in context',
        description: 'Keep contact details, customer attributes, source, and interaction history together instead of scattered across chats and spreadsheets.',
    },
    {
        icon: QrCode,
        title: 'QR and NFC touchpoints',
        description: 'Give every campaign, counter, event, or printed standee a simple path into your customer journey.',
    },
    {
        icon: MessageCircle,
        title: 'Follow up thoughtfully',
        description: 'Organise next steps and WhatsApp follow-ups around real customer context and communication preferences.',
    },
    {
        icon: Workflow,
        title: 'A clearer customer journey',
        description: 'See recent activity, upcoming follow-ups, and operational signals in one focused workspace.',
    },
    {
        icon: ShieldCheck,
        title: 'Consent-aware by design',
        description: 'Keep communication consent records, privacy requests, and important activity visible to your team.',
    },
    {
        icon: UsersRound,
        title: 'Built for teams',
        description: 'Separate workspaces and customer records so your team can work with the right context in the right place.',
    },
];

const steps = [
    ['01', 'Create a touchpoint', 'Set up a QR or NFC link for a store, campaign, event, or customer interaction.'],
    ['02', 'Capture customer details', 'Let customers share the details you request through a simple, mobile-friendly experience.'],
    ['03', 'Build the relationship', 'Review interaction history and organise the next follow-up with context.'],
    ['04', 'Learn and improve', 'Use the workspace overview to keep customer activity and pending work in view.'],
];

export default function Welcome() {
    const { auth } = usePage().props;
    const startHref = auth.user ? dashboard() : register();
    const startLabel = auth.user ? 'Open workspace' : 'Get started';

    return (
        <>
            <Head title="QLayen — Customer relationships, connected">
                <meta name="description" content="QLayen connects QR and NFC customer touchpoints with customer profiles, interaction history, and thoughtful WhatsApp follow-ups." />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <div className="ql-landing">
                <div className="ql-landing-wrap">
                    <header className="ql-landing-nav">
                        <Link href="/" aria-label="QLayen home">
                            <img className="ql-landing-logo" src="/qlayen-logo.svg" alt="QLayen" />
                        </Link>
                        <nav className="ql-landing-links" aria-label="Main navigation">
                            <a className="ql-nav-hide" href="#platform">Platform</a>
                            <a className="ql-nav-hide" href="#how-it-works">How it works</a>
                            <a className="ql-nav-hide" href="#trust">Trust</a>
                            {auth.user ? (
                                <Link className="ql-btn-primary" href={dashboard()}>Open workspace <ArrowUpRight size={16} /></Link>
                            ) : (
                                <>
                                    <Link href={login()}>Sign in</Link>
                                    <Link className="ql-btn-primary" href={register()}>Get started <ArrowRight size={16} /></Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <section className="ql-hero">
                        <div>
                            <span className="ql-pill"><Sparkles size={14} /> CUSTOMER ENGAGEMENT, SIMPLIFIED</span>
                            <h1>Turn everyday touchpoints into <span>lasting relationships.</span></h1>
                            <p className="ql-hero-copy">QLayen helps your team bring customer details, QR and NFC experiences, interaction history, and thoughtful follow-ups together — in one clear workspace.</p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link href={startHref} className="ql-btn-primary">{startLabel} <ArrowRight size={17} /></Link>
                                <a href="#how-it-works" className="ql-btn-secondary">Explore how it works <ArrowDownRight size={16} /></a>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-[#6b7c97]">
                                <span className="inline-flex items-center gap-2"><Check size={15} className="text-[#18b9ad]" /> Customer context in one place</span>
                                <span className="inline-flex items-center gap-2"><Check size={15} className="text-[#18b9ad]" /> Consent-aware workflows</span>
                            </div>
                        </div>
                        <div className="ql-hero-visual">
                            <img
                                className="ql-hero-photo"
                                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1100&q=85"
                                alt="Small business owner helping a customer at a point of sale"
                                loading="eager"
                            />
                            <div className="ql-floating-card ql-hero-bubble">
                                <span className="grid size-10 place-items-center rounded-xl bg-[#e5fbf8] text-[#087f82]"><QrCode size={20} /></span>
                                <span><small>Customer touchpoint</small><strong>Scan · Connect · Continue</strong></span>
                            </div>
                            <div className="ql-floating-card ql-hero-stat">
                                <span className="grid size-10 place-items-center rounded-xl bg-[#edf4ff] text-[#145df5]"><MessageCircle size={20} /></span>
                                <span><small>Follow-up, with context</small><strong>Every conversation matters</strong></span>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="ql-section ql-section-soft" id="platform">
                    <div className="ql-landing-wrap">
                        <div className="ql-section-title">
                            <span className="ql-pill">ONE CONNECTED WORKSPACE</span>
                            <h2>Less scattered data. More meaningful follow-through.</h2>
                            <p>From the first touchpoint to the next conversation, QLayen helps teams keep the important details close at hand.</p>
                        </div>
                        <div className="ql-feature-grid">
                            {features.map(({ icon: Icon, title, description }) => (
                                <article className="ql-feature" key={title}>
                                    <span className="ql-feature-icon"><Icon size={22} strokeWidth={1.8} /></span>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="ql-section" id="how-it-works">
                    <div className="ql-landing-wrap">
                        <div className="ql-section-title">
                            <span className="ql-pill">A SIMPLE FLOW</span>
                            <h2>From a small interaction to a stronger relationship.</h2>
                            <p>Start with a simple customer touchpoint, then give your team the context to take the next step.</p>
                        </div>
                        <div className="ql-flow-grid">
                            {steps.map(([number, title, description]) => (
                                <article className="ql-flow-step" key={number}>
                                    <b>{number}</b>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="ql-section ql-section-soft" id="trust">
                    <div className="ql-landing-wrap">
                        <div className="grid items-center gap-10 md:grid-cols-2">
                            <div>
                                <span className="ql-pill"><ShieldCheck size={14} /> BUILT WITH RESPONSIBILITY IN MIND</span>
                                <h2 className="mt-5 max-w-xl text-3xl leading-tight font-extrabold tracking-[-.055em] md:text-4xl">Customer relationships begin with trust.</h2>
                                <p className="mt-5 max-w-xl text-sm leading-7 text-[#6b7c97]">Keep communication preferences and privacy requests visible alongside your day-to-day customer operations. QLayen is designed to support a more deliberate, accountable way to manage customer information.</p>
                                <ul className="mt-6 grid gap-3 text-sm font-semibold text-[#334c72]">
                                    <li className="flex items-center gap-3"><Check size={17} className="text-[#18b9ad]" /> Communication consent records</li>
                                    <li className="flex items-center gap-3"><Check size={17} className="text-[#18b9ad]" /> Privacy request workflow</li>
                                    <li className="flex items-center gap-3"><Check size={17} className="text-[#18b9ad]" /> Workspace activity log</li>
                                </ul>
                            </div>
                            <div className="relative overflow-hidden rounded-[28px] bg-[#10264d] p-7 text-white md:p-10">
                                <div className="absolute -top-12 -right-8 size-48 rounded-full border border-white/10 shadow-[0_0_0_30px_rgba(255,255,255,0.03),0_0_0_60px_rgba(255,255,255,0.025)]" />
                                <div className="relative">
                                    <div className="grid size-14 place-items-center rounded-2xl bg-white/10 text-[#55e4d4]"><ShieldCheck size={28} /></div>
                                    <p className="mt-7 text-xs font-bold tracking-[.16em] text-[#55e4d4] uppercase">Clear context. Clear accountability.</p>
                                    <h3 className="mt-3 max-w-sm text-2xl leading-tight font-extrabold tracking-[-.04em]">Make customer care part of the workflow.</h3>
                                    <p className="mt-4 text-sm leading-7 text-blue-100/75">A record of an interaction is not proof of a verified identity or a delivered message. Keep actions, consent, and delivery status distinct.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20">
                    <div className="ql-landing-wrap">
                        <div className="ql-cta">
                            <div>
                                <h2>Make your next customer interaction count.</h2>
                                <p>Bring your customer touchpoints and follow-up workflow into one focused space with QLayen.</p>
                            </div>
                            <Link href={startHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#145df5] no-underline transition hover:bg-blue-50">{startLabel} <ArrowRight size={17} /></Link>
                        </div>
                        <footer className="ql-footer">
                            <Link href="/" aria-label="QLayen home"><img src="/qlayen-logo.svg" alt="QLayen" className="w-32" /></Link>
                            <p>© {new Date().getFullYear()} QLayen. Customer relationships, connected.</p>
                            <a href="#platform" className="inline-flex items-center gap-2">Back to top <ArrowUpRight size={14} /></a>
                        </footer>
                    </div>
                </section>
            </div>
        </>
    );
}
