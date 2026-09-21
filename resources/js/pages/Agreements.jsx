import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

function StatusBadge({ status }) {
    const map = {
        draft: 'bg-black text-white dark:bg-white dark:text-zinc-950',
        pending: 'bg-[#F2842F] text-black',
        locked: 'bg-emerald-400 text-black',
        accepted: 'bg-emerald-400 text-black',
        rejected: 'bg-red-400 text-black',
        changes_requested: 'bg-[#F2842F] text-black',
        completed: 'bg-black text-white dark:bg-white dark:text-zinc-950',
        cancelled: 'bg-red-400 text-black',
    };
    return <span className={`inline-flex rounded-lg border-2 border-black px-3 py-1 text-xs font-black uppercase ${map[status] ?? 'bg-black text-white dark:bg-white dark:text-zinc-950'}`}>{status}</span>;
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
        <div className="min-h-full bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-100">
            <div className="flex h-16 items-center justify-between border-b-2 border-black bg-white px-4 sm:px-6 dark:bg-zinc-900">
                <h1 className="text-xl font-black uppercase tracking-tight">Agreements</h1>
                <Link
                    to="/app/create"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-[#F2842F] px-4 py-1.5 text-sm font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
                >
                    <PlusIcon className="size-4" strokeWidth={3} />
                    New agreement
                </Link>
            </div>

            <div className="max-w-5xl px-4 py-8 sm:px-6">
                <p className="font-mono text-xs font-bold opacity-60">{agreements.length} total</p>

            {loading ? (
                <p className="mt-6 text-sm font-bold uppercase opacity-50">Loading…</p>
            ) : agreements.length === 0 ? (
                <div className="mt-6 rounded-2xl border-2 border-dashed border-black/40 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="text-sm font-black">No agreements yet.</p>
                    <p className="mt-2 text-xs font-bold opacity-60">
                        {user?.role === 'freelancer' ? 'Agreements assigned to you will appear here.' : 'Create one from the button above.'}
                    </p>
                </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {agreements.map((a) => (
                            <Link
                                key={a.id}
                                to={`/app/agreements/${a.id}`}
                                className="block rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] dark:bg-zinc-900"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-mono text-xs font-bold opacity-50">{a.agreement_id}</p>
                                        <p className="mt-1 font-black">{a.title}</p>
                                        <p className="mt-1 line-clamp-2 text-sm font-medium opacity-60">{a.description}</p>
                                    </div>
                                    <StatusBadge status={a.status} />
                                </div>
                                <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs font-bold opacity-60">
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
