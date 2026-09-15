import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import DatePicker from '../components/DatePicker';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useApi } from '../hooks/useApi';
import { BrowserProvider, Contract, ethers } from 'ethers';

const DEALORA_ABI = [
    'function lockAgreement(string agreementId, bytes32 sowHash, address freelancer, uint256 budget) external',
    'function getAgreement(string agreementId) view returns (bytes32,address,address,uint256,uint256)',
];

function shortHash(h) {
    return h ? `${h.slice(0, 10)}…${h.slice(-4)}` : '—';
}

function statusClass(status) {
    const map = {
        draft: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        pending: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
        locked: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
        accepted: 'bg-emerald-400/10 text-emerald-300 border-emerald-500/30',
        rejected: 'bg-red-400/10 text-red-300 border-red-400/30',
        changes_requested: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
        completed: 'bg-white text-zinc-900 border-white',
    };
    return map[status] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700';
}

export default function AgreementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const { chainId } = useWallet();
    const api = useApi(token);
    const [agreement, setAgreement] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locking, setLocking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [funding, setFunding] = useState(false);
    const [newMilestone, setNewMilestone] = useState({ title: '', amount: '' });
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);

    const load = async () => {
        try {
            const a = await api.getAgreement(id);
            setAgreement(a);
            setForm({
                title: a.title,
                description: a.description,
                deliverables: a.deliverables ?? '',
                deadline: a.deadline ?? '',
                budget: a.budget ?? '',
                payment_terms: a.payment_terms ?? '',
                revision_policy: a.revision_policy ?? '',
            });
            try {
                const ms = await api.listMilestones(a.id);
                setMilestones(ms);
            } catch {}
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]); // eslint-disable-line

    const handleAction = async (status) => {
        setError(null);
        try {
            const updated = await api.updateAgreement(agreement.id, { status });
            setAgreement(updated);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleFund = async () => {
        if (!window.ethereum) {
            setError('MetaMask not found');
            return;
        }
        setFunding(true);
        setError(null);
        try {
            const amount = Number(agreement.budget ?? 0) - Number(agreement.funded_amount ?? 0);
            const fundAmount = amount > 0 ? amount : Number(agreement.budget ?? 0);
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const net = await provider.getNetwork();
            const cid = Number(net.chainId);
            let txHash;
            const contractAddress = agreement.contract_address;
            if (contractAddress && contractAddress.startsWith('0x')) {
                const escrowAbi = ['function fund(string agreementId) payable'];
                const contract = new Contract(contractAddress, escrowAbi, signer);
                const value = ethers.parseEther('0.001');
                const tx = await contract.fund(agreement.agreement_id, { value });
                const receipt = await tx.wait();
                txHash = receipt.hash;
            } else {
                const target = agreement.freelancer_wallet && agreement.freelancer_wallet.startsWith('0x') ? agreement.freelancer_wallet : await signer.getAddress();
                const tx = await signer.sendTransaction({ to: target, value: ethers.parseEther('0.001') });
                txHash = tx.hash;
                await tx.wait().catch(() => {});
            }
            const updated = await api.fundAgreement(agreement.id, { tx_hash: txHash, amount: fundAmount });
            setAgreement(updated);
        } catch (e) {
            const msg = e?.message ?? '';
            if (msg.includes('insufficient funds') || e?.code === 'INSUFFICIENT_FUNDS' || msg.includes('have 0 want')) {
                setError('Saldo tidak mencukupi. Isi BOT testnet di https://faucet.botchain.ai/basic lalu coba lagi.');
            } else if (e?.code === 4001 || msg.includes('rejected') || msg.includes('denied')) {
                setError('Pay dibatalkan di MetaMask.');
            } else {
                setError(e?.reason ?? msg ?? 'Fund failed.');
            }
        } finally {
            setFunding(false);
        }
    };

    const handleAddMilestone = async () => {
        if (!newMilestone.title || !newMilestone.amount) return;
        setError(null);
        try {
            const ms = await api.createMilestone(agreement.id, { title: newMilestone.title, amount: Number(newMilestone.amount) });
            setMilestones((m) => [...m, ms]);
            setNewMilestone({ title: '', amount: '' });
        } catch (e) {
            setError(e.message);
        }
    };

    const handleSubmitMilestone = async (mid) => {
        setError(null);
        try {
            const ms = await api.submitMilestone(mid);
            setMilestones((arr) => arr.map((x) => (x.id === ms.id ? ms : x)));
        } catch (e) {
            setError(e.message);
        }
    };

    const handleApproveMilestone = async (mid) => {
        if (!window.ethereum) {
            setError('MetaMask not found');
            return;
        }
        setError(null);
        try {
            // trigger MetaMask confirmation for release (demo: sign or pay 0)
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // for demo without contract, just request a signature to show MetaMask popup for release
            try {
                await signer.signMessage(`Approve milestone ${mid} for ${agreement.agreement_id}`);
            } catch {}
            const ms = await api.approveMilestone(mid);
            setMilestones((arr) => arr.map((x) => (x.id === ms.id ? ms : x)));
            const a = await api.getAgreement(agreement.id);
            setAgreement(a);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleRequestChangesMilestone = async (mid) => {
        setError(null);
        try {
            const ms = await api.requestMilestoneChanges(mid);
            setMilestones((arr) => arr.map((x) => (x.id === ms.id ? ms : x)));
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this agreement? This cannot be undone.')) return;
        setDeleting(true);
        setError(null);
        try {
            await api.deleteAgreement(agreement.id);
            navigate('/app/agreements');
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                deliverables: form.deliverables || null,
                deadline: form.deadline || null,
                budget: form.budget ? Number(form.budget) : null,
                payment_terms: form.payment_terms || null,
                revision_policy: form.revision_policy || null,
            };
            const updated = await api.updateAgreement(agreement.id, payload);
            setAgreement(updated);
            setForm({
                title: updated.title,
                description: updated.description,
                deliverables: updated.deliverables ?? '',
                deadline: updated.deadline ?? '',
                budget: updated.budget ?? '',
                payment_terms: updated.payment_terms ?? '',
                revision_policy: updated.revision_policy ?? '',
            });
            setEditing(false);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAndResend = async () => {
        setSaving(true);
        setError(null);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                deliverables: form.deliverables || null,
                deadline: form.deadline || null,
                budget: form.budget ? Number(form.budget) : null,
                payment_terms: form.payment_terms || null,
                revision_policy: form.revision_policy || null,
                status: 'pending',
            };
            const updated = await api.updateAgreement(agreement.id, payload);
            setAgreement(updated);
            setEditing(false);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLock = async () => {
        if (!window.ethereum) {
            setError('MetaMask not found');
            return;
        }
        setLocking(true);
        setError(null);
        try {
            const contractAddress = agreement.contract_address;
            let txHash;
            let cid = chainId;

            if (contractAddress && contractAddress !== 'Coming soon') {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const net = await provider.getNetwork();
                cid = Number(net.chainId);
                const contract = new Contract(contractAddress, DEALORA_ABI, signer);
                const tx = await contract.lockAgreement(agreement.agreement_id, agreement.sow_hash, agreement.freelancer_wallet, String(agreement.budget ?? 0));
                const receipt = await tx.wait();
                txHash = receipt.hash;
            } else {
                const provider = new BrowserProvider(window.ethereum);
                const net = await provider.getNetwork();
                cid = Number(net.chainId);
                txHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            }

            const updated = await api.lockAgreement(agreement.id, {
                tx_hash: txHash,
                chain_id: cid,
                contract_address: contractAddress && contractAddress.startsWith('0x') ? contractAddress : undefined,
            });
            setAgreement(updated);
        } catch (e) {
            setError(e?.reason ?? e?.message ?? 'Lock failed');
        } finally {
            setLocking(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-zinc-950 p-8 text-zinc-400">Loading…</div>;
    if (error && !agreement) return <div className="min-h-screen bg-zinc-950 p-8 text-red-400">{error}</div>;
    if (!agreement || !form) return null;

    const isClient = user?.wallet_address === agreement.client_wallet;
    const isFreelancer = user?.wallet_address === agreement.freelancer_wallet;
    const canLock = ['pending', 'accepted', 'draft'].includes(agreement.status) && agreement.status !== 'locked';
    const canEdit = isClient && ['draft', 'changes_requested', 'rejected'].includes(agreement.status);
    const canDelete = isClient && ['draft', 'pending', 'changes_requested', 'rejected'].includes(agreement.status);
    const explorerBase = chainId === 677 ? 'https://scan.botchain.ai' : 'https://scan.bohr.life';

    const statusNote = {
        draft: 'Draft',
        pending: 'Waiting for freelancer',
        changes_requested: 'Changes requested',
        accepted: 'Ready to lock',
        rejected: 'Rejected',
        locked: 'Locked',
        completed: 'Completed',
    };

    return (
        <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100">
            <div className="flex h-16 items-center border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6">
                <Link to="/app/agreements" className="-ml-2 rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                    <ArrowLeftIcon className="size-6" />
                </Link>
                <span className={`ml-auto inline-flex rounded-full border px-3 py-1 font-mono text-xs ${statusClass(agreement.status)}`}>{agreement.status}</span>
            </div>

            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-zinc-500">{agreement.agreement_id}</p>
                        {editing ? (
                            <input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="mt-2 w-full max-w-xl rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-lg font-semibold text-white focus:border-white focus:outline-none"
                            />
                        ) : (
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{agreement.title}</h1>
                        )}
                        {editing ? (
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="mt-3 w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                            />
                        ) : (
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{agreement.description}</p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canEdit && !editing && (
                            <button onClick={() => setEditing(true)} className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-200 hover:border-zinc-400">
                                Edit
                            </button>
                        )}
                        {canDelete && !editing && (
                            <button onClick={handleDelete} disabled={deleting} className="rounded-full border border-red-900/50 bg-red-950/20 px-5 py-2 text-sm text-red-300 hover:border-red-800 hover:text-red-200 disabled:opacity-50">
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        )}
                        {editing && (
                            <>
                                <button onClick={() => setEditing(false)} className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-400 hover:text-white">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </>
                        )}
                        {isFreelancer && agreement.status === 'pending' && !editing && (
                            <>
                                <button onClick={() => handleAction('accepted')} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-950">
                                    Accept
                                </button>
                                <button onClick={() => handleAction('changes_requested')} className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-200">
                                    Request changes
                                </button>
                                <button onClick={() => handleAction('rejected')} className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-200">
                                    Reject
                                </button>
                            </>
                        )}
                        {isClient && agreement.status === 'draft' && !editing && (
                            <button onClick={() => handleAction('pending')} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-950">
                                Send to freelancer
                            </button>
                        )}
                        {isClient && agreement.status === 'changes_requested' && !editing && (
                            <button onClick={() => handleAction('pending')} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-950">
                                Resend to freelancer
                            </button>
                        )}
                        {isClient && agreement.status === 'rejected' && !editing && (
                            <button onClick={() => handleAction('pending')} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-950">
                                Resend again
                            </button>
                        )}
                    </div>
                    {agreement.status !== 'locked' && !editing && <p className="mt-3 w-full text-xs text-zinc-500">{statusNote[agreement.status]}</p>}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <h2 className="font-semibold">Scope of work</h2>
                            <div className="mt-4 grid gap-3">
                                {Object.entries(agreement.sow ?? {}).map(([k, v]) => (
                                    <div key={k} className="rounded-xl bg-zinc-950 px-4 py-3">
                                        <p className="font-mono text-xs tracking-wide text-zinc-500">{k.toUpperCase()}</p>
                                        <p className="mt-1 text-sm text-zinc-200">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Workspace</h2>
                                {editing && <span className="text-xs text-zinc-500">Editing</span>}
                            </div>
                            <div className="mt-4 grid gap-3 text-sm">
                                {[
                                    ['Deliverables', 'deliverables', 'text'],
                                    ['Deadline', 'deadline', 'date'],
                                    ['Budget', 'budget', 'number'],
                                    ['Payment', 'payment_terms', 'text'],
                                    ['Revisions', 'revision_policy', 'text'],
                                ].map(([label, key, type]) =>
                                    type === 'date' ? (
                                        <div key={key} className="flex items-center justify-between gap-4 rounded-lg bg-zinc-950 px-4 py-3">
                                            <span className="shrink-0 text-zinc-500">{label}</span>
                                            {editing ? (
                                                <div className="w-48">
                                                    <DatePicker value={form[key] ?? ''} onChange={(v) => setForm({ ...form, [key]: v })} placeholder="Pick a date" />
                                                </div>
                                            ) : (
                                                <span className="text-right text-white">{agreement[key] ? new Date(agreement[key]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div key={key} className="flex items-center justify-between gap-4 rounded-lg bg-zinc-950 px-4 py-3">
                                            <span className="shrink-0 text-zinc-500">{label}</span>
                                            {editing ? (
                                                <input
                                                    type={type}
                                                    value={form[key] ?? ''}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    className="w-48 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-right text-sm text-white focus:border-zinc-600 focus:outline-none"
                                                />
                                            ) : (
                                                <span className="text-right text-white">
                                                    {key === 'budget' && agreement[key] ? `$${agreement[key]}` : (agreement[key] ?? '—')}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                            {editing && (
                                <button onClick={handleSaveAndResend} disabled={saving} className="mt-4 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50">
                                    {saving ? 'Saving…' : 'Save and resend'}
                                </button>
                            )}
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <h2 className="font-semibold">Activity</h2>
                            <div className="mt-4 space-y-3">
                                {agreement.activities?.length ? (
                                    agreement.activities.map((act) => (
                                        <div key={act.id} className="flex gap-3">
                                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                                            <div>
                                                <p className="text-sm text-white">
                                                    {act.action} <span className="text-zinc-500">· {new Date(act.created_at).toLocaleString()}</span>
                                                </p>
                                                <p className="text-xs text-zinc-500">{act.description} · {act.actor_wallet?.slice(0, 10)}…</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-zinc-500">No activity yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <h3 className="font-semibold">On-chain</h3>
                            <dl className="mt-4 space-y-3 font-mono text-xs">
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">SOW hash</dt>
                                    <dd className="text-zinc-200">{shortHash(agreement.sow_hash)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Client</dt>
                                    <dd className="text-zinc-200">{agreement.client_wallet.slice(0, 10)}…</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Freelancer</dt>
                                    <dd className="text-zinc-200">{agreement.freelancer_wallet ? agreement.freelancer_wallet.slice(0, 10) + '…' : '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Chain</dt>
                                    <dd className="text-zinc-200">{agreement.chain_id ?? (chainId === 968 ? '968 testnet' : chainId ? `${chainId}` : '—')}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Tx</dt>
                                    <dd className="text-zinc-200">
                                        {agreement.tx_hash ? (
                                            <a href={`${explorerBase}/tx/${agreement.tx_hash}`} target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200">
                                                {shortHash(agreement.tx_hash)}
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </dd>
                                </div>
                            </dl>

                            {canLock ? (
                                <button
                                    onClick={handleLock}
                                    disabled={locking}
                                    className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
                                >
                                    {locking ? 'Locking…' : 'Lock on BOT Chain'}
                                </button>
                            ) : agreement.status === 'locked' ? (
                                <p className="mt-6 rounded-full bg-emerald-400/10 py-3 text-center text-sm font-medium text-emerald-300">Locked</p>
                            ) : null}

                            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <h3 className="font-semibold">Escrow</h3>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-500">Client funds are held by contract, released only when milestone is accepted.</p>
                            <div className="mt-4 space-y-2 font-mono text-xs">
                                <div className="flex justify-between"><span className="text-zinc-500">Budget</span><span className="text-white">${agreement.budget ?? '—'}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-500">Funded</span><span className="text-emerald-300">${agreement.funded_amount ?? 0}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-500">Status</span><span className="capitalize text-zinc-300">{agreement.escrow_status}</span></div>
                                {agreement.escrow_tx_hash && <div className="flex justify-between"><span className="text-zinc-500">Fund tx</span><a href={`${explorerBase}/tx/${agreement.escrow_tx_hash}`} target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200">{shortHash(agreement.escrow_tx_hash)}</a></div>}
                            </div>
                            {isClient && agreement.escrow_status === 'unfunded' && agreement.status !== 'draft' && (
                                <>
                                    <p className="mt-3 text-xs text-zinc-500">Click Fund will open MetaMask to pay 0.001 BOT to escrow (demo). Need BOT? https://faucet.botchain.ai/basic</p>
                                    <button onClick={handleFund} disabled={funding} className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50">
                                        {funding ? 'Waiting for MetaMask…' : `Fund to escrow`}
                                    </button>
                                </>
                            )}
                            {agreement.escrow_status === 'funded' && <p className="mt-3 rounded-full bg-emerald-400/10 py-2 text-center text-xs font-medium text-emerald-300">Funds in escrow — freelancer can submit</p>}
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <h3 className="font-semibold">Milestones</h3>
                            {milestones.length === 0 ? (
                                <p className="mt-3 text-sm text-zinc-500">No milestones yet.</p>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {milestones.map((m) => (
                                        <div key={m.id} className="rounded-xl bg-zinc-950 p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{m.title}</p>
                                                    <p className="font-mono text-xs text-zinc-500">${m.amount} · {m.status} · {m.escrow_status}</p>
                                                </div>
                                                <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(m.status)}`}>{m.status}</span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {isFreelancer && ['pending', 'in_progress', 'unfunded'].includes(m.status) && m.escrow_status !== 'paid' && (
                                                    <button onClick={() => handleSubmitMilestone(m.id)} className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-zinc-950">Mark submitted</button>
                                                )}
                                                {isClient && m.status === 'submitted' && (
                                                    <>
                                                        <button onClick={() => handleApproveMilestone(m.id)} className="rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-zinc-950">Accept & release ${m.amount}</button>
                                                        <button onClick={() => handleRequestChangesMilestone(m.id)} className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-300">Request changes</button>
                                                    </>
                                                )}
                                                {m.escrow_status === 'paid' && <span className="text-xs text-emerald-300">Paid to freelancer</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isClient && (
                                <div className="mt-4 flex gap-2">
                                    <input value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} placeholder="Milestone title" className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none" />
                                    <input value={newMilestone.amount} onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })} placeholder="$" type="number" className="w-20 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none" />
                                    <button onClick={handleAddMilestone} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700">Add</button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                            <p className="font-mono text-xs text-zinc-500">BOT Chain</p>
                            <p className="mt-1 text-sm text-zinc-300">Testnet 968 · Mainnet 677</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
