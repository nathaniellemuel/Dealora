import { useState } from 'react';
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
    const { user, setRole } = useAuth();
    const [copied, setCopied] = useState(false);

    const copyWallet = async () => {
        if (!user?.wallet_address) return;
        await navigator.clipboard.writeText(user.wallet_address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="min-h-full bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-100">
            <div className="flex h-16 items-center justify-between border-b-2 border-black bg-white px-4 sm:px-6 dark:bg-zinc-900">
                <h1 className="text-xl font-black uppercase tracking-tight">Settings</h1>
                <button
                    onClick={copyWallet}
                    title="Click to copy full address"
                    className="group inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#FFF6E9] px-3 py-1 font-mono text-xs font-bold shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-yellow-200 hover:shadow-[2px_2px_0_#000] dark:bg-zinc-950 dark:text-zinc-300"
                >
                    {user?.wallet_address?.slice(0, 10)}…
                    {copied ? (
                        <CheckIcon className="size-4 text-emerald-500" strokeWidth={3} />
                    ) : (
                        <ClipboardDocumentIcon className="size-4 opacity-40 transition-opacity group-hover:opacity-100" />
                    )}
                </button>
            </div>

            <div className="max-w-5xl px-4 py-8 sm:px-6">
                <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#000] dark:bg-zinc-900">
                    <h2 className="text-sm font-black uppercase tracking-wide">Default view</h2>
                    <p className="mt-1 text-sm font-bold opacity-60">
                        Current: <span className="capitalize text-black dark:text-white">{user?.role ?? 'both'}</span> — one wallet can act as both, this only sets the starting tab.
                    </p>
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={() => setRole('client')}
                            className={`rounded-xl border-2 border-black px-5 py-2 text-sm font-black uppercase transition-all ${
                                user?.role === 'client'
                                    ? 'bg-[#F2842F] text-black shadow-[3px_3px_0_#000]'
                                    : 'bg-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            Client
                        </button>
                        <button
                            onClick={() => setRole('freelancer')}
                            className={`rounded-xl border-2 border-black px-5 py-2 text-sm font-black uppercase transition-all dark:border-white ${
                                user?.role === 'freelancer'
                                    ? 'bg-emerald-400 text-black shadow-[3px_3px_0_#000]'
                                    : 'bg-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            Freelancer
                        </button>
                    </div>
                </div>

                <button
                    onClick={copyWallet}
                    title="Click to copy"
                    className="group mt-6 block w-full rounded-2xl border-2 border-black bg-white p-6 text-left shadow-[5px_5px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] dark:bg-zinc-900"
                >
                    <span className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black uppercase tracking-wide opacity-60">Wallet — click to copy</span>
                        {copied ? (
                            <span className="inline-flex items-center gap-1 rounded-lg border-2 border-black bg-emerald-400 px-2 py-0.5 text-[11px] font-black uppercase text-black">
                                <CheckIcon className="size-3.5" strokeWidth={3} /> Copied!
                            </span>
                        ) : (
                            <ClipboardDocumentIcon className="size-5 opacity-40 transition-opacity group-hover:opacity-100" />
                        )}
                    </span>
                    <span className="mt-2 block break-all font-mono text-sm font-bold">{user?.wallet_address}</span>
                    <span className="mt-3 block font-mono text-xs opacity-50">BOT Chain · Testnet 968 · Mainnet 677</span>
                </button>
            </div>
        </div>
    );
}
