import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import DatePicker from '../components/DatePicker';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

export default function CreateAgreement() {
    const { token } = useAuth();
    const api = useApi(token);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        deliverables: '',
        deadline: '',
        budget: '',
        payment_terms: '',
        revision_policy: 'Two revision rounds within scope. Additional scope requires a new agreement.',
        freelancer_wallet: '',
    });
    const [sow, setSow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sowLoading, setSowLoading] = useState(false);
    const [error, setError] = useState(null);

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const previewSow = async () => {
        if (!form.description) return;
        setSowLoading(true);
        setError(null);
        try {
            const r = await api.generateSow(form.description);
            setSow(r);
        } catch (e) {
            setError(e.message);
        } finally {
            setSowLoading(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                deliverables: form.deliverables || undefined,
                deadline: form.deadline || undefined,
                budget: form.budget ? Number(form.budget) : undefined,
                payment_terms: form.payment_terms || undefined,
                revision_policy: form.revision_policy || undefined,
                freelancer_wallet: form.freelancer_wallet || undefined,
            };
            const created = await api.createAgreement(payload);
            navigate(`/app/agreements/${created.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6">
                <Link to="/app/agreements" className="-ml-2 rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                    <ArrowLeftIcon className="size-6" />
                </Link>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-500">Draft until locked</span>
            </div>

            <div className="grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
                <form onSubmit={submit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-7">
                    <h1 className="text-xl font-semibold tracking-tight">New agreement</h1>
                    <p className="mt-1 text-sm text-zinc-500">Plain words are enough. AI will structure it.</p>

                    <div className="mt-6 space-y-5">
                        <div>
                            <label className="text-xs font-medium tracking-wide text-zinc-400">TITLE</label>
                            <input
                                value={form.title}
                                onChange={(e) => update('title', e.target.value)}
                                placeholder="Website Build Agreement"
                                required
                                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium tracking-wide text-zinc-400">DESCRIPTION</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => update('description', e.target.value)}
                                placeholder="Build a three-page React landing page, deliver it in two weeks, and pay $300."
                                required
                                rows={4}
                                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={previewSow}
                                disabled={sowLoading || !form.description}
                                className="mt-3 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-white disabled:opacity-50"
                            >
                                {sowLoading ? 'Generating…' : 'Preview scope →'}
                            </button>
                        </div>

                        <div className="grid gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium tracking-wide text-zinc-400">DELIVERABLES</label>
                                <input
                                    value={form.deliverables}
                                    onChange={(e) => update('deliverables', e.target.value)}
                                    placeholder="Three pages, preview link, repo"
                                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium tracking-wide text-zinc-400">DEADLINE</label>
                                <div className="mt-2">
                                    <DatePicker value={form.deadline} onChange={(v) => update('deadline', v)} placeholder="Pick a date" />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium tracking-wide text-zinc-400">BUDGET (USD)</label>
                                <input
                                    type="number"
                                    value={form.budget}
                                    onChange={(e) => update('budget', e.target.value)}
                                    placeholder="300"
                                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium tracking-wide text-zinc-400">FREELANCER WALLET</label>
                                <input
                                    value={form.freelancer_wallet}
                                    onChange={(e) => update('freelancer_wallet', e.target.value)}
                                    placeholder="0x..."
                                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium tracking-wide text-zinc-400">PAYMENT TERMS</label>
                                <input
                                    value={form.payment_terms}
                                    onChange={(e) => update('payment_terms', e.target.value)}
                                    placeholder="$300 on accepted delivery"
                                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium tracking-wide text-zinc-400">REVISIONS</label>
                                <input
                                    value={form.revision_policy}
                                    onChange={(e) => update('revision_policy', e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                                />
                            </div>
                        </div>

                        {error && <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}

                        <button disabled={loading} className="w-full rounded-full bg-white py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50">
                            {loading ? 'Creating…' : 'Create agreement'}
                        </button>
                    </div>
                </form>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-sm font-semibold tracking-wide text-zinc-200">Preview</h2>
                    <p className="mt-1 text-xs text-zinc-500">What both sides will review.</p>
                    {!sow ? (
                        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
                            <p className="text-sm text-zinc-500">No preview yet.</p>
                            <p className="mt-1 text-xs text-zinc-600">Write a description and click Preview scope.</p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {Object.entries(sow.sow).map(([k, v]) => (
                                <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                                    <p className="font-mono text-xs tracking-wide text-zinc-500">{k.toUpperCase()}</p>
                                    <p className="mt-1 text-sm leading-relaxed text-zinc-200">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                                </div>
                            ))}
                            <p className="break-all font-mono text-xs text-zinc-600">Hash {sow.hash}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
