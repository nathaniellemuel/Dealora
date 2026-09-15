import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useApi } from '../hooks/useApi';

export default function Dashboard() {
    const { user } = useAuth();
    const { address, shortAddress } = useWallet();
    const { token } = useAuth();
    const api = useApi(token);
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [verifyId, setVerifyId] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);
    const [verifyError, setVerifyError] = useState(null);

    useEffect(() => {
        api.listAgreements()
            .then(setAgreements)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

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

    return (
        <div>
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6">
                <h1 className="text-xl font-semibold tracking-tight text-white">Dashboard</h1>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-500">BOT Chain · Testnet 968</span>
            </div>

            <div className="max-w-5xl px-4 py-8 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold tracking-tight">
                        {user?.role === 'client' ? 'Client workspace' : user?.role === 'freelancer' ? 'Freelancer workspace' : 'Workspace'}
                    </h2>
                    <button
                        onClick={async () => {
                            await navigator.clipboard.writeText(address);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-300 hover:border-zinc-600"
                    >
                        {shortAddress}
                        {copied ? <CheckIcon className="size-4 text-emerald-400" /> : <ClipboardDocumentIcon className="size-4 text-zinc-500" />}
                    </button>
                </div>
                {copied && <p className="mt-2 text-right text-xs text-emerald-300">Copied to clipboard</p>}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Agreements', value: agreements.length },
                        { label: 'Pending', value: agreements.filter((a) => a.status === 'pending').length },
                        { label: 'Locked', value: agreements.filter((a) => a.status === 'locked').length },
                        { label: 'Value', value: `$${agreements.reduce((s, a) => s + Number(a.budget ?? 0), 0).toLocaleString()}` },
                    ].map((s) => (
                        <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                            <p className="text-xs tracking-wide text-zinc-500">{s.label}</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Status</span>
                        <span>{agreements.length ? `${Math.round((agreements.filter((a) => a.status === 'locked').length / agreements.length) * 100)}% locked` : 'No data'}</span>
                    </div>
                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div className="bg-amber-400" style={{ width: `${agreements.length ? (agreements.filter((a) => a.status === 'pending').length / agreements.length) * 100 : 0}%` }} />
                        <div className="bg-emerald-400" style={{ width: `${agreements.length ? (agreements.filter((a) => a.status === 'locked').length / agreements.length) * 100 : 0}%` }} />
                        <div className="bg-white" style={{ width: `${agreements.length ? (agreements.filter((a) => a.status === 'draft').length / agreements.length) * 100 : 0}%` }} />
                    </div>
                    <div className="mt-3 flex gap-4 font-mono text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-white" /> draft</span>
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" /> pending</span>
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> locked</span>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <h3 className="text-sm font-semibold tracking-wide text-zinc-200">Verify</h3>
                    <form onSubmit={handleVerify} className="mt-4 flex gap-2">
                        <input
                            value={verifyId}
                            onChange={(e) => setVerifyId(e.target.value)}
                            placeholder="AG-... or 0x..."
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                        />
                        <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950">Go</button>
                    </form>
                    {verifyResult && <pre className="mt-4 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono text-xs text-zinc-300">{JSON.stringify(verifyResult, null, 2)}</pre>}
                    {verifyError && <p className="mt-3 text-xs text-red-400">{verifyError}</p>}
                </div>

                {loading ? (
                    <p className="mt-8 text-sm text-zinc-500">Loading recent…</p>
                ) : (
                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold tracking-wide text-zinc-200">Recent</h2>
                            <Link to="/app/agreements" className="text-xs text-zinc-500 hover:text-white">View all →</Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {agreements.slice(0, 3).map((a) => (
                                <Link key={a.id} to={`/app/agreements/${a.id}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700">
                                    <p className="font-mono text-xs text-zinc-500">{a.agreement_id}</p>
                                    <p className="mt-1 font-medium text-white">{a.title}</p>
                                </Link>
                            ))}
                            {!agreements.length && <p className="text-sm text-zinc-500">No agreements yet.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
