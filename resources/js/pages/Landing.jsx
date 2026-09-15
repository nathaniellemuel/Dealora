import { useState } from 'react';
import { Bars3Icon, CheckIcon, DocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const MENU_ITEMS = [
    { label: 'GitHub', href: 'https://github.com/nathaniellemuel/Dealora' },
    { label: 'Presentation', href: '#' },
    { label: 'Documentation', href: '#' },
];

function RecordCard() {
    const rows = [
        ['Scope hash', '0x9be2…44a0'],
        ['Client', '0x1a2b…3c4d'],
        ['Freelancer', '0x5e6f…7a8b'],
        ['Payment', '$300 on accepted delivery'],
        ['Timeline', '14 days · check-in day 7'],
    ];

    return (
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400/10">
                        <DocumentCheckIcon className="size-5 text-emerald-400" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-white">Website Build Agreement</p>
                        <p className="font-mono text-xs text-zinc-500">AG-2026-001</p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <CheckIcon className="size-3.5" />
                    Locked
                </span>
            </div>

            <dl className="space-y-1 px-3 py-3">
                {rows.map(([k, v]) => (
                    <div
                        key={k}
                        className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-800/60"
                    >
                        <dt className="text-xs text-zinc-500">{k}</dt>
                        <dd className="font-mono text-xs text-zinc-200">{v}</dd>
                    </div>
                ))}
            </dl>

            <div className="border-t border-zinc-800 px-5 py-4">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Recorded on BOT Chain</span>
                    <span className="font-medium text-zinc-300">Block confirmed</span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
                </div>
                <div className="mt-4 flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-500">tx 0x4d21…f7e9</span>
                    <Link to="/app" className="font-medium text-emerald-300 hover:text-emerald-200">
                        Verify record
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Landing() {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative flex h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 55% 45% at 75% 30%, rgba(52,211,153,0.09), transparent 70%), radial-gradient(ellipse 45% 40% at 15% 85%, rgba(255,255,255,0.05), transparent 70%)',
                }}
            />

            <header className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="#top" className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-white text-lg font-semibold text-zinc-950">
                        D
                    </span>
                    <span className="text-base font-semibold tracking-tight">Dealora</span>
                </a>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Toggle menu"
                    className="rounded-md p-2 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
                >
                    {open ? <XMarkIcon className="size-6" /> : <Bars3Icon className="size-6" />}
                </button>

                {open && (
                    <nav className="absolute right-4 top-16 z-20 w-52 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl shadow-black/60 sm:right-6">
                        {MENU_ITEMS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="block rounded-lg px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                )}
            </header>

            <main className="relative flex flex-1 items-center">
                <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-300">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                            </span>
                            Built on BOT Chain · Testnet 968
                        </p>
                        <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
                            A clear record of what was agreed.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">
                            Dealora turns freelance project chats into a structured scope of work and stores its fingerprint
                            on-chain, so both sides can check the original terms later.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link
                                to="/app"
                                className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200"
                            >
                                Launch App
                            </Link>
                        </div>
                        <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
                            {[
                                ['MetaMask', 'Wallet sign-in'],
                                ['AI scope', 'Brief to structure'],
                                ['On-chain', 'Hash on BOT Chain'],
                            ].map(([title, sub]) => (
                                <div key={title}>
                                    <p className="text-sm font-semibold text-white">{title}</p>
                                    <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden justify-center lg:flex">
                        <RecordCard />
                    </div>
                </div>
            </main>
        </div>
    );
}
