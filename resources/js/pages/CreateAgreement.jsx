import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import DatePicker from '../components/DatePicker';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

const INPUT = 'mt-2 w-full rounded-xl border-2 border-black bg-[#FFF6E9] px-3.5 py-2.5 text-sm font-bold text-black placeholder:font-medium placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#F2842F] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';

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
        <div className="min-h-full bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-100">
            <div className="flex h-16 items-center justify-between border-b-2 border-black bg-white px-4 sm:px-6 dark:bg-zinc-900">
                <Link to="/app/agreements" className="-ml-2 rounded-lg border-2 border-transparent p-2 hover:border-black hover:bg-yellow-200/60 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-white">
                    <ArrowLeftIcon className="size-6" strokeWidth={2.4} />
                </Link>
                <span className="rounded-lg border-2 border-black bg-[#FFF6E9] px-3 py-1 font-mono text-xs font-bold opacity-70 shadow-[3px_3px_0_#000] dark:bg-zinc-950 dark:text-zinc-400">Draft until locked</span>
            </div>

            <div className="grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
                <form onSubmit={submit} className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#000] sm:p-7 dark:bg-zinc-900">
                    <h1 className="text-xl font-black uppercase tracking-tight">New agreement</h1>
                    <p className="mt-1 text-sm font-bold opacity-60">Plain words are enough. AI will structure it.</p>

                    <div className="mt-6 space-y-5">
                        <div>
                            <label className="text-xs font-black uppercase tracking-wide opacity-60">Title</label>
                            <input
                                value={form.title}
                                onChange={(e) => update('title', e.target.value)}
                                placeholder="Website Build Agreement"
                                required
                                className={INPUT}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide opacity-60">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => update('description', e.target.value)}
                                placeholder="Build a three-page React landing page, deliver it in two weeks, and pay $300."
                                required
                                rows={4}
                                className={INPUT}
                            />
                            <button
                                type="button"
                                onClick={previewSow}
                                disabled={sowLoading || !form.description}
                                className="mt-3 rounded-xl border-2 border-black bg-[#B8F135] px-4 py-1.5 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] disabled:opacity-50"
                            >
                                {sowLoading ? 'Generating…' : 'Preview scope →'}
                            </button>
                        </div>

                        <div className="grid gap-4 border-t-2 border-black/10 pt-5 sm:grid-cols-2 dark:border-zinc-800">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wide opacity-60">Deliverables</label>
                                <input
                                    value={form.deliverables}
                                    onChange={(e) => update('deliverables', e.target.value)}
                                    placeholder="Three pages, preview link, repo"
                                    className={INPUT}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wide opacity-60">Deadline</label>
                                <div className="mt-2">
                                    <DatePicker value={form.deadline} onChange={(v) => update('deadline', v)} placeholder="Pick a date" />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wide opacity-60">Budget (USD)</label>
                                <input
                                    type="number"
                                    value={form.budget}
                                    onChange={(e) => update('budget', e.target.value)}
                                    placeholder="300"
                                    className={INPUT}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wide opacity-60">Freelancer wallet</label>
                                <input
                                    value={form.freelancer_wallet}
                                    onChange={(e) => update('freelancer_wallet', e.target.value)}
                                    placeholder="0x..."
                                    className={`${INPUT} font-mono`}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 border-t-2 border-black/10 pt-5 sm:grid-cols-2 dark:border-zinc-800">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wide opacity-60">Payment terms</label>
                                <input
                                    value={form.payment_terms}
                                    onChange={(e) => update('payment_terms', e.target.value)}
                                    placeholder="$300 on accepted delivery"
                                    className={INPUT}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wide opacity-60">Revisions</label>
                                <input
                                    value={form.revision_policy}
                                    onChange={(e) => update('revision_policy', e.target.value)}
                                    className={INPUT}
                                />
                            </div>
                        </div>

                        {error && <p className="rounded-xl border-2 border-red-500 bg-red-100 px-4 py-3 text-sm font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

                        <button disabled={loading} className="w-full rounded-xl border-2 border-black bg-black py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0_#B8F135] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B8F135] disabled:opacity-50 dark:bg-white dark:text-black dark:shadow-[4px_4px_0_#000]">
                            {loading ? 'Creating…' : 'Create agreement'}
                        </button>
                    </div>
                </form>

                <div className="h-fit rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#000] dark:bg-zinc-900">
                    <h2 className="text-sm font-black uppercase tracking-wide">Preview</h2>
                    <p className="mt-1 text-xs font-bold opacity-60">What both sides will review.</p>
                    {!sow ? (
                        <div className="mt-6 rounded-xl border-2 border-dashed border-black/30 bg-[#FFF6E9] p-6 text-center dark:border-zinc-700 dark:bg-zinc-950">
                            <p className="text-sm font-black">No preview yet.</p>
                            <p className="mt-1 text-xs font-bold opacity-60">Write a description and click Preview scope.</p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {Object.entries(sow.sow).map(([k, v]) => (
                                <div key={k} className="rounded-xl border-2 border-black bg-[#FFF6E9] p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                    <p className="font-mono text-xs font-black tracking-wide opacity-60">{k.toUpperCase()}</p>
                                    <p className="mt-1 text-sm font-medium leading-relaxed">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                                </div>
                            ))}
                            <p className="break-all font-mono text-xs opacity-50">Hash {sow.hash}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
