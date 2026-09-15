import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

function StatusBadge({ status }) {
    const map = {
        draft: 'bg-zinc-800 text-zinc-300',
        pending: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
        locked: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
        accepted: 'bg-emerald-400/10 text-emerald-300',
        rejected: 'bg-red-400/10 text-red-300',
        changes_requested: 'bg-amber-400/10 text-amber-300',
        completed: 'bg-white text-zinc-900',
    };
    return <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${map[status] ?? 'bg-zinc-800 text-zinc-300'}`}>{status}</span>;
}

export default function Agreements() {
    const { token, user } = useAuth();
    const api = useApi(token);
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.listAgreements()
            .then(setAgreements)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6">
                <h1 className="text-xl font-semibold tracking-tight text-white">Agreements</h1>
                <Link to="/app/create" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200">
                    <PlusIcon className="size-4" />
                    New agreement
                </Link>
            </div>

            <div className="max-w-5xl px-4 py-8 sm:px-6">
                <p className="font-mono text-xs text-zinc-500">{agreements.length} total</p>

            {loading ? (
                <p className="mt-6 text-sm text-zinc-500">Loading…</p>
            ) : agreements.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                    <p className="text-sm text-zinc-400">No agreements yet.</p>
                    <p className="mt-2 text-xs text-zinc-500">
                        {user?.role === 'client' ? 'Create one from the button above.' : 'Agreements assigned to you will appear here.'}
                    </p>
                </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {agreements.map((a) => (
                            <Link key={a.id} to={`/app/agreements/${a.id}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-mono text-xs text-zinc-500">{a.agreement_id}</p>
                                        <p className="mt-1 font-semibold text-white">{a.title}</p>
                                        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{a.description}</p>
                                    </div>
                                    <StatusBadge status={a.status} />
                                </div>
                                <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs text-zinc-500">
                                    <span>{a.budget ? `$${a.budget}` : '—'}</span>
                                    <span>{a.deadline ?? '—'}</span>
                                    <span>{a.client_wallet.slice(0, 6)}…</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
