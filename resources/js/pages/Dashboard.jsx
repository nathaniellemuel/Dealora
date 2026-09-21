import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardDocumentIcon,
    CheckIcon,
    PlusIcon,
    MagnifyingGlassCircleIcon,
    BriefcaseIcon,
    UserGroupIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useApi } from '../hooks/useApi';

const VIEW_META = {
    client: {
        label: 'As Client',
        icon: BriefcaseIcon,
        pill: 'bg-[#F2842F]',
        workspace: 'Client workspace',
        statLabels: ['Deals', 'Pending', 'Locked', 'Spend'],
        emptyTitle: 'No deals yet.',
        emptyHint: 'Create your first deal to lock it on-chain.',
    },
    freelancer: {
        label: 'As Freelancer',
        icon: UserGroupIcon,
        pill: 'bg-emerald-400',
        workspace: 'Freelancer workspace',
        statLabels: ['Gigs', 'Pending', 'Locked', 'Earnings'],
        emptyTitle: 'No gigs assigned yet.',
        emptyHint: 'Share your wallet address so clients can assign deals to you.',
    },
};

const STATUS_STYLE = {
    draft: 'bg-zinc-200 text-black dark:bg-white dark:text-zinc-950',
    pending: 'bg-[#F2842F] text-black',
    locked: 'bg-emerald-400 text-black',
};

export default function Dashboard() {
    const { user, token, setRole } = useAuth();
    const { address, shortAddress } = useWallet();
    const api = useApi(token);
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [verifyId, setVerifyId] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);
    const [verifyError, setVerifyError] = useState(null);

    const viewKey = `dealora-view-${address?.toLowerCase() ?? 'anon'}`;
    const [view, setView] = useState(() => localStorage.getItem(viewKey) || user?.role || 'client');

    useEffect(() => {
        api.listAgreements('all')
            .then(setAgreements)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const switchView = (v) => {
        if (v === view) return;
        setView(v);
        localStorage.setItem(viewKey, v);
        // persist as default view; ignore failures, switching stays instant
        setRole(v).catch(() => {});
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setVerifyError(null);
        setVerifyResult(null);
        try {
            const r = await api.verify(verifyId.trim());
            setVerifyResult(r);
        } catch (err) {
            setVerifyError(err.message);
        }
    };

    const copyAddress = async (done) => {
        await navigator.clipboard.writeText(address);
        done(true);
        setTimeout(() => done(false), 1500);
    };

    const mine = address?.toLowerCase();
    const asClient = agreements.filter((a) => a.client_wallet?.toLowerCase() === mine);
    const asFreelancer = agreements.filter((a) => a.freelancer_wallet?.toLowerCase() === mine);
    const deals = view === 'client' ? asClient : asFreelancer;
    const meta = VIEW_META[view];
    const accent = meta.pill;

    const lockedCount = deals.filter((a) => a.status === 'locked').length;
    const pendingCount = deals.filter((a) => a.status === 'pending').length;
    const draftCount = deals.filter((a) => a.status === 'draft').length;
    const totalValue = deals.reduce((s, a) => s + Number(a.budget ?? 0), 0);
    const pct = (n) => (deals.length ? Math.round((n / deals.length) * 100) : 0);

    const stats = [
        { label: meta.statLabels[0], value: deals.length, badge: 'bg-black text-white dark:bg-white dark:text-zinc-950' },
        { label: meta.statLabels[1], value: pendingCount, badge: 'bg-[#F2842F] text-black' },
        { label: meta.statLabels[2], value: lockedCount, badge: 'bg-emerald-400 text-black' },
        { label: meta.statLabels[3], value: `$${totalValue.toLocaleString()}`, badge: `${accent} text-black` },
    ];

    return (
        <div className="min-h-full bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-100">
            <div className="flex h-16 items-center justify-between border-b-2 border-black bg-white px-4 sm:px-6 dark:bg-zinc-900">
                <h1 className="text-xl font-black uppercase tracking-tight">Dashboard</h1>
                <span className="rounded-lg border-2 border-black bg-[#FFF6E9] px-3 py-1 font-mono text-xs font-bold opacity-70 shadow-[3px_3px_0_#000] dark:bg-zinc-950 dark:text-zinc-400">
                    BOT Chain · Testnet 968
                </span>
            </div>

            <div className="max-w-5xl px-4 py-8 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-black uppercase tracking-tight">{meta.workspace}</h2>
                    <button
                        onClick={() => copyAddress(setCopied)}
                        title="Click to copy full address"
                        className="group inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        {shortAddress}
                        {copied ? (
                            <CheckIcon className="size-4 text-emerald-500" strokeWidth={3} />
                        ) : (
                            <ClipboardDocumentIcon className="size-4 opacity-40 transition-opacity group-hover:opacity-100" />
                        )}
                    </button>
                </div>
                {copied && <p className="mt-2 text-right text-xs font-bold text-emerald-600 dark:text-emerald-300">Copied to clipboard</p>}

                {/* pills switch */}
                <div className="mt-6 inline-flex rounded-2xl border-2 border-black bg-white p-1.5 shadow-[4px_4px_0_#000] dark:bg-zinc-900">
                    {['client', 'freelancer'].map((v) => {
                        const m = VIEW_META[v];
                        const active = view === v;
                        const count = v === 'client' ? asClient.length : asFreelancer.length;
                        return (
                            <button
                                key={v}
                                onClick={() => switchView(v)}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase transition-all sm:px-5 ${
                                    active
                                        ? `border-2 border-black text-black shadow-[3px_3px_0_#000] ${m.pill}`
                                        : 'border-2 border-transparent opacity-60 hover:bg-yellow-200/60 hover:opacity-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                                }`}
                            >
                                <m.icon className="size-4" strokeWidth={2.8} />
                                {m.label}
                                <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${active ? 'bg-black/20' : 'bg-black/10 dark:bg-zinc-800'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* per-view CTA */}
                <div className="mt-4">
                    {view === 'client' ? (
                        <Link
                            to="/app/create"
                            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#F2842F] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
                        >
                            <PlusIcon className="size-4" strokeWidth={3} />
                            New deal
                        </Link>
                    ) : (
                        <button
                            onClick={() => copyAddress(setShared)}
                            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-400 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
                        >
                            <ShareIcon className="size-4" strokeWidth={2.8} />
                            {shared ? 'Address copied!' : 'Share my address'}
                        </button>
                    )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#000] transition-transform hover:-translate-y-1 dark:bg-zinc-900"
                        >
                            <span className={`inline-block rounded-md border-2 border-black px-2 py-0.5 text-[11px] font-black uppercase ${s.badge}`}>
                                {s.label}
                            </span>
                            <p className="mt-3 text-2xl font-black tracking-tight">{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#000] dark:bg-zinc-900">
                    <div className="flex items-center justify-between text-xs font-black uppercase opacity-60">
                        <span>Status</span>
                        <span className="opacity-100">{deals.length ? `${pct(lockedCount)}% locked` : 'No data'}</span>
                    </div>
                    <div className="mt-3 flex h-3 overflow-hidden rounded-full border-2 border-black bg-black/10 dark:bg-zinc-950">
                        <div className="bg-[#F2842F]" style={{ width: `${pct(pendingCount)}%` }} />
                        <div className="bg-emerald-400" style={{ width: `${pct(lockedCount)}%` }} />
                        <div className="bg-black dark:bg-white" style={{ width: `${pct(draftCount)}%` }} />
                    </div>
                    <div className="mt-3 flex gap-4 font-mono text-xs font-bold opacity-70">
                        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-black bg-black dark:bg-white" /> draft</span>
                        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-black bg-[#F2842F]" /> pending</span>
                        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-black bg-emerald-400" /> locked</span>
                    </div>
                </div>

                <div className="mt-4 rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#000] dark:bg-zinc-900">
                    <h3 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide">
                        <MagnifyingGlassCircleIcon className="size-5" strokeWidth={2.5} />
                        Verify record
                    </h3>
                    <form onSubmit={handleVerify} className="mt-4 flex gap-2">
                        <input
                            value={verifyId}
                            onChange={(e) => setVerifyId(e.target.value)}
                            placeholder="AG-... or 0x..."
                            className="w-full rounded-xl border-2 border-black bg-[#FFF6E9] px-3 py-2 font-mono text-sm font-bold placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#F2842F] dark:bg-zinc-950 dark:text-white"
                        />
                        <button className="rounded-xl border-2 border-black bg-black px-5 py-2 text-sm font-black uppercase text-white shadow-[3px_3px_0_#B8F135] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B8F135] dark:bg-white dark:text-black dark:shadow-[3px_3px_0_#000]">
                            Go
                        </button>
                    </form>
                    {verifyResult && <pre className="mt-4 overflow-auto rounded-xl border-2 border-black bg-[#FFF6E9] p-3 font-mono text-xs dark:bg-zinc-950 dark:text-zinc-300">{JSON.stringify(verifyResult, null, 2)}</pre>}
                    {verifyError && <p className="mt-3 rounded-xl border-2 border-red-500 bg-red-100 px-3 py-2 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">{verifyError}</p>}
                </div>

                {loading ? (
                    <p className="mt-8 text-sm font-bold uppercase opacity-50">Loading recent…</p>
                ) : (
                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-wide">
                                {view === 'client' ? 'My deals' : 'My gigs'}
                            </h2>
                            <Link to="/app/agreements" className="rounded-lg border-2 border-black px-3 py-1 text-xs font-black uppercase opacity-70 transition-opacity hover:opacity-100 dark:border-zinc-700">
                                View all →
                            </Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {deals.slice(0, 3).map((a) => (
                                <Link
                                    key={a.id}
                                    to={`/app/agreements/${a.id}`}
                                    className="flex items-center justify-between gap-3 rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] dark:bg-zinc-900"
                                >
                                    <div className="min-w-0">
                                        <p className="font-mono text-xs font-bold opacity-50">{a.agreement_id}</p>
                                        <p className="mt-1 truncate font-black">{a.title}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-lg border-2 border-black px-2.5 py-1 text-[11px] font-black uppercase ${STATUS_STYLE[a.status] ?? STATUS_STYLE.draft}`}>
                                        {a.status}
                                    </span>
                                </Link>
                            ))}
                            {!deals.length && (
                                <div className="rounded-2xl border-2 border-dashed border-black/40 p-6 text-center dark:border-zinc-700">
                                    <p className="text-sm font-black">{meta.emptyTitle}</p>
                                    <p className="mt-1 text-xs font-bold opacity-60">{meta.emptyHint}</p>
                                    {view === 'client' ? (
                                        <Link
                                            to="/app/create"
                                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#F2842F] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
                                        >
                                            <PlusIcon className="size-4" strokeWidth={3} />
                                            Create deal
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => copyAddress(setShared)}
                                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-400 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
                                        >
                                            <ShareIcon className="size-4" strokeWidth={2.8} />
                                            {shared ? 'Address copied!' : 'Share my address'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
