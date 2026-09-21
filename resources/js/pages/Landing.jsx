import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import {
    Bars3Icon,
    XMarkIcon,
    CheckIcon,
    SparklesIcon,
    DocumentTextIcon,
    WalletIcon,
    LockClosedIcon,
    MagnifyingGlassCircleIcon,
    ClipboardDocumentCheckIcon,
    UserGroupIcon,
    BriefcaseIcon,
    RocketLaunchIcon,
    ArrowRightIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/24/outline';

const NAV_LINKS = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'For you', href: '#for-you' },
];

const SERVICES = [
    {
        icon: SparklesIcon,
        color: 'bg-[#F2842F]',
        title: 'AI Scope Generator',
        desc: 'Turn a messy brief into a clean scope of work: deliverables, timeline, payment, revisions.',
    },
    {
        icon: DocumentTextIcon,
        color: 'bg-sky-300',
        title: 'Shared Agreement Doc',
        desc: 'One shared document both sides can read, review, and correct together.',
    },
    {
        icon: WalletIcon,
        color: 'bg-orange-300',
        title: 'MetaMask Sign-In',
        desc: 'Clients and freelancers sign in with a wallet. The address is the identity.',
    },
    {
        icon: LockClosedIcon,
        color: 'bg-lime-300',
        title: 'On-Chain Lock',
        desc: 'The agreement fingerprint is recorded through a smart contract on BOT Chain.',
    },
    {
        icon: MagnifyingGlassCircleIcon,
        color: 'bg-pink-300',
        title: 'Public Verification',
        desc: 'Pull the record any time with an agreement ID or transaction hash.',
    },
    {
        icon: ClipboardDocumentCheckIcon,
        color: 'bg-violet-300',
        title: 'Status Tracking',
        desc: 'Follow every deal from draft and pending all the way to locked.',
    },
];

const STEPS = [
    { title: 'Connect wallet', desc: 'Client and freelancer sign in with MetaMask on BOT Chain.', color: 'bg-[#F2842F]' },
    { title: 'Describe the project', desc: 'Write deliverables, timeline, and payment terms in plain words.', color: 'bg-sky-300' },
    { title: 'Review the scope', desc: 'AI drafts the structure. Both sides read and fix it together.', color: 'bg-orange-300' },
    { title: 'Lock the agreement', desc: 'Once accepted, the fingerprint is stored on-chain.', color: 'bg-lime-300' },
    { title: 'Verify any time', desc: 'Compare the original doc against the tamper-evident hash.', color: 'bg-pink-300' },
];

const CLIENT_PERKS = [
    'Scope creep stops where the written scope stops',
    'On-chain proof if delivery misses the promise',
    'Timeline and milestones documented in one place',
    'Pay with confidence once terms are locked',
];

const FREELANCER_PERKS = [
    'No more endless revisions outside the agreement',
    'Payment terms are clear before work starts',
    'Verifiable on-chain record for your portfolio',
    'Disputes point back to the same original doc',
];

function Reveal({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.12 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}>
            {children}
        </div>
    );
}

function BrutalButton({ to, children, color = 'bg-lime-300', className = '' }) {
    return (
        <Link
            to={to}
            className={`inline-flex items-center gap-2 rounded-xl border-2 border-black px-6 py-3 text-sm font-black uppercase tracking-wide text-black shadow-[4px_4px_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] ${color} ${className}`}
        >
            {children}
            <ArrowRightIcon className="size-4" strokeWidth={2.5} />
        </Link>
    );
}

export default function Landing() {
    const [menuState, setMenuState] = useState('closed'); // closed | open | closing
    const closeTimer = useRef(null);

    const closeMenu = () => {
        setMenuState((s) => {
            if (s !== 'open') return s;
            clearTimeout(closeTimer.current);
            closeTimer.current = setTimeout(() => setMenuState('closed'), 270);
            return 'closing';
        });
    };

    const toggleMenu = () => {
        if (menuState === 'open') closeMenu();
        else {
            clearTimeout(closeTimer.current);
            setMenuState('open');
        }
    };

    useEffect(() => () => clearTimeout(closeTimer.current), []);
    const { theme, toggle: toggleTheme } = useTheme();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setScrollY(window.scrollY));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    const progress = Math.min(1, scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight));

    return (
        <div className={theme === 'dark' ? 'dark' : ''}>
            <div className="min-h-screen bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-[#141210] dark:text-[#FFF6E9]">
                {/* scroll progress */}
                <div className="fixed inset-x-0 top-0 z-40 h-1.5 bg-transparent">
                    <div className="h-full bg-[#B8F135] transition-[width]" style={{ width: `${progress * 100}%` }} />
                </div>

                {/* NAVBAR */}
                <header className="sticky top-0 z-30 border-b-2 border-black bg-[#FFF6E9]/95 backdrop-blur transition-colors dark:border-white dark:bg-[#141210]/95">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                        <a href="#top" className="flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-lg border-2 border-black bg-black text-lg font-black text-[#B8F135] dark:border-white">
                                D
                            </span>
                            <span className="text-lg font-black uppercase tracking-tight">Dealora</span>
                            <span className="hidden rounded-full border-2 border-black bg-pink-300 px-2 py-0.5 text-[10px] font-black uppercase text-black sm:inline">
                                BOT Chain
                            </span>
                        </a>
                        <nav className="hidden items-center gap-1 md:flex">
                            {NAV_LINKS.map((l) => (
                                <a key={l.label} href={l.href} className="rounded-lg px-3 py-2 text-sm font-bold uppercase transition-colors hover:bg-[#F2842F] hover:text-black">
                                    {l.label}
                                </a>
                            ))}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                                className="ml-1 rounded-xl border-2 border-black bg-white p-2 text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[3px_3px_0_#fff]"
                            >
                                {theme === 'dark' ? <SunIcon className="size-5" strokeWidth={2.2} /> : <MoonIcon className="size-5" strokeWidth={2.2} />}
                            </button>
                            <Link
                                to="/app"
                                className="ml-2 rounded-xl border-2 border-black bg-black px-5 py-2 text-sm font-black uppercase text-white shadow-[4px_4px_0_#B8F135] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#B8F135]"
                            >
                                Launch App
                            </Link>
                        </nav>
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                                className="rounded-lg border-2 border-black bg-white p-1.5 text-black shadow-[3px_3px_0_#000] dark:border-white dark:bg-zinc-900 dark:text-white"
                            >
                                {theme === 'dark' ? <SunIcon className="size-6" strokeWidth={2.2} /> : <MoonIcon className="size-6" strokeWidth={2.2} />}
                            </button>
                            <button
                                type="button"
                                onClick={toggleMenu}
                                aria-label="Toggle menu"
                                className="rounded-lg border-2 border-black bg-white p-1.5 text-black shadow-[3px_3px_0_#000] dark:border-white dark:bg-zinc-900 dark:text-white"
                            >
                                {menuState === 'open' ? <XMarkIcon className="size-6" strokeWidth={2.5} /> : <Bars3Icon className="size-6" strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>
                    {menuState !== 'closed' && (
                        <nav
                            className={`${menuState === 'closing' ? 'animate-drop-up' : 'animate-drop-down'} absolute inset-x-0 top-full z-40 overflow-hidden border-b-2 border-t-2 border-black bg-white px-4 py-3 text-black shadow-[0_6px_0_#000] md:hidden dark:border-white dark:bg-zinc-900 dark:text-white`}
                        >
                            {NAV_LINKS.map((l) => (
                                <a key={l.label} href={l.href} onClick={closeMenu} className="block rounded-lg px-3 py-2.5 font-bold uppercase hover:bg-[#F2842F] hover:text-black">
                                    {l.label}
                                </a>
                            ))}
                            <Link to="/app" className="mt-2 block rounded-xl border-2 border-black bg-black px-3 py-2.5 text-center font-black uppercase text-white">
                                Launch App
                            </Link>
                        </nav>
                    )}
                </header>

                {/* HERO with parallax */}
                <section id="top" className="relative overflow-hidden border-b-2 border-black dark:border-white">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-24 top-10 size-96 rounded-full border-2 border-black bg-[#F2842F]/60 blur-0 dark:border-white"
                        style={{ transform: `translateY(${scrollY * 0.12}px)` }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full border-2 border-black bg-pink-300/60 dark:border-white"
                        style={{ transform: `translateY(${scrollY * -0.08}px)` }}
                    />
                    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
                        <div className="animate-pop-in">
                            <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1.5 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]">
                                <span className="size-2.5 animate-pulse rounded-full border-2 border-black bg-emerald-400" />
                                Testnet 968 · Mainnet 677
                            </p>
                            <h1 className="mt-5 text-4xl font-black uppercase leading-[1.02] tracking-tight sm:text-6xl">
                                Chat alone <span className="bg-[#F2842F] px-2 text-black">is not enough.</span> Lock the deal.
                            </h1>
                            <p className="mt-5 max-w-xl border-l-4 border-black pl-4 text-lg font-medium leading-relaxed dark:border-white">
                                <strong>Dealora</strong> is a decentralized agreement platform for clients and freelancers. Turn
                                project requirements into a structured scope of work, then keep its verifiable fingerprint on BOT Chain.
                            </p>
                            <div className="mt-7 flex gap-2 sm:gap-3">
                                <BrutalButton to="/app" color="bg-[#B8F135]" className="flex-1 justify-center px-3 py-2.5 text-xs sm:flex-none sm:px-6 sm:py-3 sm:text-sm">
                                    Create a deal
                                </BrutalButton>
                                <BrutalButton to="/app" color="bg-white" className="flex-1 justify-center px-3 py-2.5 text-xs sm:flex-none sm:px-6 sm:py-3 sm:text-sm">
                                    Verify record
                                </BrutalButton>
                            </div>
                            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                                {[
                                    ['100%', 'Tamper-evident'],
                                    ['5 min', 'Scope draft'],
                                    ['2 sides', 'Mutual approval'],
                                ].map(([n, l], i) => (
                                    <Reveal key={l} delay={i * 100}>
                                        <div className="rounded-xl border-2 border-black bg-white p-3 text-center text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1">
                                            <p className="text-xl font-black">{n}</p>
                                            <p className="text-xs font-bold uppercase">{l}</p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>

                        <div className="relative" style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
                            <div className="animate-float rounded-2xl border-2 border-black bg-white p-5 text-black shadow-[8px_8px_0_#000]">
                                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                                    <div>
                                        <p className="font-black uppercase">Website Build Agreement</p>
                                        <p className="font-mono text-xs font-bold">AG-2026-001</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-lime-300 px-3 py-1 text-xs font-black uppercase">
                                        <CheckIcon className="size-3.5" strokeWidth={3} /> Locked
                                    </span>
                                </div>
                                <dl className="space-y-2 py-4">
                                    {[
                                        ['Scope hash', '0x9be2…44a0'],
                                        ['Client', '0x1a2b…3c4d'],
                                        ['Freelancer', '0x5e6f…7a8b'],
                                        ['Payment', '$300 on accepted delivery'],
                                        ['Timeline', '14 days · day-7 check-in'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between gap-3 rounded-lg border-2 border-black bg-[#FFF6E9] px-3 py-2">
                                            <dt className="text-xs font-bold uppercase">{k}</dt>
                                            <dd className="font-mono text-xs font-bold">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <div className="rounded-xl border-2 border-black bg-black p-3 text-white">
                                    <div className="flex justify-between font-mono text-xs">
                                        <span>tx 0x4d21…f7e9</span>
                                        <span className="font-black uppercase text-[#B8F135]">Confirmed</span>
                                    </div>
                                </div>
                            </div>
                            <span
                                className="animate-float absolute -left-3 -top-3 rotate-[-6deg] rounded-lg border-2 border-black bg-pink-300 px-3 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]"
                                style={{ '--float-rotate': '-6deg', transform: `translateY(${scrollY * -0.04}px)`, animationDelay: '0.8s' }}
                            >
                                On-chain!
                            </span>
                            <span
                                className="animate-float absolute -bottom-3 -right-2 rotate-[4deg] rounded-lg border-2 border-black bg-sky-300 px-3 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]"
                                style={{ '--float-rotate': '4deg', transform: `translateY(${scrollY * 0.09}px)`, animationDelay: '1.6s' }}
                            >
                                Zero disputes
                            </span>
                        </div>
                    </div>
                </section>

                {/* MARQUEE */}
                <div className="overflow-hidden border-b-2 border-black bg-black py-3 text-white dark:border-white">
                    <div className="animate-marquee flex w-max gap-8 whitespace-nowrap text-sm font-black uppercase tracking-widest">
                        {[0, 1].map((n) => (
                            <span key={n}>Scope ★ Lock ★ Verify ★ Scope ★ Lock ★ Verify ★ Scope ★ Lock ★ Verify ★&nbsp;</span>
                        ))}
                    </div>
                </div>

                {/* ABOUT */}
                <section id="about" className="border-b-2 border-black bg-white text-black dark:border-white dark:bg-[#1E1B16] dark:text-[#FFF6E9]">
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                        <Reveal>
                            <p className="inline-block rounded-full border-2 border-black bg-orange-300 px-4 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]">
                                What is Dealora?
                            </p>
                            <h2 className="mt-4 max-w-2xl text-3xl font-black uppercase leading-tight sm:text-4xl">
                                Chat requirements, turned into proof you can trust.
                            </h2>
                        </Reveal>
                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            <Reveal delay={80}>
                                <div className="h-full rounded-2xl border-2 border-black bg-red-200 p-6 text-black shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-1">
                                    <p className="text-sm font-black uppercase">The problem</p>
                                    <p className="mt-2 font-medium">
                                        Freelance work usually starts in chat. Requirements drift, payment terms stay vague, and
                                        neither side keeps a copy of the original terms both can trust. When disputes pop up,
                                        there is no shared reference.
                                    </p>
                                </div>
                            </Reveal>
                            <Reveal delay={160}>
                                <div className="h-full rounded-2xl border-2 border-black bg-lime-200 p-6 text-black shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-1">
                                    <p className="text-sm font-black uppercase">The Dealora fix</p>
                                    <p className="mt-2 font-medium">
                                        Write the agreement in a fixed structure, then store its fingerprint on-chain. Change a
                                        single word and the hash no longer matches. AI structures the text, the chain stores the proof.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* SERVICES */}
                <section id="services" className="border-b-2 border-black dark:border-white">
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                        <Reveal>
                            <p className="inline-block rounded-full border-2 border-black bg-sky-300 px-4 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]">
                                Services
                            </p>
                            <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">What do you get?</h2>
                        </Reveal>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {SERVICES.map((s, i) => (
                                <Reveal key={s.title} delay={(i % 3) * 90}>
                                    <div className="h-full rounded-2xl border-2 border-black bg-white p-5 text-black shadow-[6px_6px_0_#000] transition-all hover:-translate-y-1.5 hover:shadow-[8px_8px_0_#000] dark:shadow-[6px_6px_0_rgba(255,255,255,0.85)]">
                                        <span className={`inline-flex size-11 items-center justify-center rounded-xl border-2 border-black ${s.color}`}>
                                            <s.icon className="size-6 text-black" strokeWidth={2.2} />
                                        </span>
                                        <h3 className="mt-4 font-black uppercase">{s.title}</h3>
                                        <p className="mt-1.5 text-sm font-medium leading-relaxed">{s.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="border-b-2 border-black bg-black text-white dark:border-white">
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                        <Reveal>
                            <p className="inline-block rounded-full border-2 border-white bg-[#F2842F] px-4 py-1 text-xs font-black uppercase text-black">
                                How it works
                            </p>
                            <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">5 steps, deal locked.</h2>
                        </Reveal>
                        <div className="mt-8 grid gap-4 md:grid-cols-5">
                            {STEPS.map((s, i) => (
                                <Reveal key={s.title} delay={i * 90}>
                                    <div className="h-full rounded-2xl border-2 border-white bg-zinc-900 p-4 transition-transform hover:-translate-y-1.5">
                                        <span className={`inline-block rounded-lg border-2 border-white px-2.5 py-1 text-xs font-black text-black ${s.color}`}>
                                            {i + 1}
                                        </span>
                                        <h3 className="mt-3 font-black uppercase leading-snug">{s.title}</h3>
                                        <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">{s.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FOR YOU */}
                <section id="for-you" className="border-b-2 border-black bg-white text-black dark:border-white dark:bg-[#1E1B16] dark:text-[#FFF6E9]">
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                        <Reveal>
                            <p className="inline-block rounded-full border-2 border-black bg-violet-300 px-4 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]">
                                Benefits
                            </p>
                            <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">For clients & freelancers.</h2>
                        </Reveal>
                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            <Reveal delay={80}>
                                <div className="h-full rounded-2xl border-2 border-black bg-sky-200 p-6 text-black shadow-[6px_6px_0_#000]">
                                    <p className="inline-flex items-center gap-2 font-black uppercase">
                                        <BriefcaseIcon className="size-5" strokeWidth={2.5} /> For clients
                                    </p>
                                    <ul className="mt-4 space-y-2.5">
                                        {CLIENT_PERKS.map((p) => (
                                            <li key={p} className="flex gap-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold transition-transform hover:translate-x-1">
                                                <CheckIcon className="size-5 shrink-0" strokeWidth={3} /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                            <Reveal delay={160}>
                                <div className="h-full rounded-2xl border-2 border-black bg-pink-200 p-6 text-black shadow-[6px_6px_0_#000]">
                                    <p className="inline-flex items-center gap-2 font-black uppercase">
                                        <UserGroupIcon className="size-5" strokeWidth={2.5} /> For freelancers
                                    </p>
                                    <ul className="mt-4 space-y-2.5">
                                        {FREELANCER_PERKS.map((p) => (
                                            <li key={p} className="flex gap-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold transition-transform hover:translate-x-1">
                                                <CheckIcon className="size-5 shrink-0" strokeWidth={3} /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section>
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                        <Reveal>
                            <div className="rounded-3xl border-2 border-black bg-[#B8F135] p-8 text-center text-black shadow-[8px_8px_0_#000] sm:p-12 dark:border-white">
                                <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase">
                                    <RocketLaunchIcon className="size-4" strokeWidth={2.5} /> Start free
                                </p>
                                <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black uppercase leading-tight sm:text-5xl">
                                    Ready to lock your first deal?
                                </h2>
                                <p className="mx-auto mt-3 max-w-xl font-bold">
                                    Connect a wallet, write the brief, review the scope together, then lock it on-chain. Verifiable any time.
                                </p>
                                <div className="mt-7 flex flex-wrap justify-center gap-3">
                                    <BrutalButton to="/app" color="bg-black !text-white shadow-[4px_4px_0_#fff]">
                                        Launch the app now
                                    </BrutalButton>
                                </div>
                                <p className="mt-4 font-mono text-xs font-bold">BOT Chain Testnet (968) · Mainnet (677)</p>
                            </div>
                        </Reveal>
                        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t-2 border-black pt-6 sm:flex-row dark:border-white">
                            <p className="font-black uppercase">Dealora © 2026</p>
                            <div className="flex gap-4 text-sm font-bold uppercase">
                                <a href="https://github.com/nathaniellemuel/Dealora" className="hover:underline">GitHub</a>
                                <Link to="/app" className="hover:underline">App</Link>
                            </div>
                        </footer>
                    </div>
                </section>
            </div>
        </div>
    );
}
