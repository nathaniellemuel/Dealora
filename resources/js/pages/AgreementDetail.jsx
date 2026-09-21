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

const BTN_PRIMARY = 'rounded-xl border-2 border-black bg-black px-5 py-2 text-sm font-black uppercase text-white shadow-[3px_3px_0_#B8F135] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B8F135] disabled:opacity-50 dark:bg-white dark:text-black dark:shadow-[3px_3px_0_#000]';
const BTN_GHOST = 'rounded-xl border-2 border-black px-5 py-2 text-sm font-black uppercase transition-all hover:bg-yellow-200/60 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-400';
const BTN_DANGER = 'rounded-xl border-2 border-red-500 bg-red-100 px-5 py-2 text-sm font-black uppercase text-red-700 transition-all hover:bg-red-200 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-300 dark:hover:text-red-200';
const CARD = 'rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#000] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[5px_5px_0_#000]';
const INPUT = 'rounded-xl border-2 border-black bg-[#FFF6E9] px-3 py-2 text-sm font-bold text-black placeholder:font-medium placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#F2842F] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';

function shortHash(h) {
    return h ? `${h.slice(0, 10)}…${h.slice(-4)}` : '—';
}

function statusClass(status) {
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
    return map[status] ?? 'bg-black text-white dark:bg-white dark:text-zinc-950';
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
    const [cancelling, setCancelling] = useState(false);
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

    const handleRequestCancel = async () => {
        if (!confirm('Request cancellation? The deal ends only after the other party approves.')) return;
        setCancelling(true);
        setError(null);
        try {
            const updated = await api.requestCancel(agreement.id);
            setAgreement(updated);
        } catch (e) {
            setError(e.message);
        } finally {
            setCancelling(false);
        }
    };

    const handleApproveCancel = async () => {
        if (!confirm('Approve cancellation? This ends the deal for both sides.')) return;
        setCancelling(true);
        setError(null);
        try {
            const updated = await api.approveCancel(agreement.id);
            setAgreement(updated);
        } catch (e) {
            setError(e.message);
        } finally {
            setCancelling(false);
        }
    };

    const handleWithdrawCancel = async () => {
        setCancelling(true);
        setError(null);
        try {
            const updated = await api.withdrawCancel(agreement.id);
            setAgreement(updated);
        } catch (e) {
            setError(e.message);
        } finally {
            setCancelling(false);
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

    if (loading) return <div className="min-h-screen bg-[#FFF6E9] p-8 font-bold uppercase opacity-60 dark:bg-zinc-950 dark:text-zinc-400">Loading…</div>;
    if (error && !agreement) return <div className="min-h-screen bg-[#FFF6E9] p-8 font-bold text-red-600 dark:bg-zinc-950 dark:text-red-400">{error}</div>;
    if (!agreement || !form) return null;

    const isClient = user?.wallet_address === agreement.client_wallet;
    const isFreelancer = user?.wallet_address === agreement.freelancer_wallet;
    const myWallet = (user?.wallet_address ?? '').toLowerCase();
    const cancelRequestedBy = (agreement.cancel_requested_by ?? '').toLowerCase() || null;
    const iRequestedCancel = cancelRequestedBy !== null && cancelRequestedBy === myWallet;
    const cancelCancellable = (isClient || isFreelancer) && !['completed', 'cancelled'].includes(agreement.status);
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
        cancelled: 'Cancelled by mutual agreement',
    };

    return (
        <div className="min-h-screen bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-100">
            <div className="flex h-16 items-center border-b-2 border-black bg-white px-4 sm:px-6 dark:bg-zinc-900">
                <Link to="/app/agreements" className="-ml-2 rounded-lg border-2 border-transparent p-2 hover:border-black hover:bg-yellow-200/60 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-white">
                    <ArrowLeftIcon className="size-6" strokeWidth={2.4} />
                </Link>
                <span className={`ml-auto inline-flex rounded-lg border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase ${statusClass(agreement.status)}`}>{agreement.status}</span>
            </div>

            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                {agreement.status === 'cancelled' && (
                    <div className="mb-6 rounded-2xl border-2 border-red-500 bg-red-100 p-4 shadow-[5px_5px_0_#000] dark:bg-red-950/40">
                        <p className="text-sm font-black uppercase text-red-700 dark:text-red-300">Cancelled by mutual agreement</p>
                        <p className="mt-1 text-xs font-bold text-red-700/80 dark:text-red-300/80">Both parties agreed to end this deal. The on-chain record below remains as history.</p>
                    </div>
                )}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-bold opacity-50">{agreement.agreement_id}</p>
                        {editing ? (
                            <input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className={`${INPUT} mt-2 w-full max-w-xl text-lg font-black`}
                            />
                        ) : (
                            <h1 className="mt-1 text-2xl font-black tracking-tight">{agreement.title}</h1>
                        )}
                        {editing ? (
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className={`${INPUT} mt-3 w-full max-w-2xl`}
                            />
                        ) : (
                            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed opacity-60">{agreement.description}</p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canEdit && !editing && (
                            <button onClick={() => setEditing(true)} className={BTN_GHOST}>
                                Edit
                            </button>
                        )}
                        {canDelete && !editing && (
                            <button onClick={handleDelete} disabled={deleting} className={BTN_DANGER}>
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        )}
                        {editing && (
                            <>
                                <button onClick={() => setEditing(false)} className={BTN_GHOST}>
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} className={BTN_PRIMARY}>
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </>
                        )}
                        {isFreelancer && agreement.status === 'pending' && !editing && (
                            <>
                                <button onClick={() => handleAction('accepted')} className={BTN_PRIMARY}>
                                    Accept
                                </button>
                                <button onClick={() => handleAction('changes_requested')} className={BTN_GHOST}>
                                    Request changes
                                </button>
                                <button onClick={() => handleAction('rejected')} className={BTN_GHOST}>
                                    Reject
                                </button>
                            </>
                        )}
                        {isClient && agreement.status === 'draft' && !editing && (
                            <button onClick={() => handleAction('pending')} className={BTN_PRIMARY}>
                                Send to freelancer
                            </button>
                        )}
                        {isClient && agreement.status === 'changes_requested' && !editing && (
                            <button onClick={() => handleAction('pending')} className={BTN_PRIMARY}>
                                Resend to freelancer
                            </button>
                        )}
                        {isClient && agreement.status === 'rejected' && !editing && (
                            <button onClick={() => handleAction('pending')} className={BTN_PRIMARY}>
                                Resend again
                            </button>
                        )}
                    </div>
                    {agreement.status !== 'locked' && !editing && <p className="mt-3 w-full text-xs font-bold opacity-50">{statusNote[agreement.status]}</p>}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <div className={CARD}>
                            <h2 className="font-black uppercase">Scope of work</h2>
                            <div className="mt-4 grid gap-3">
                                {Object.entries(agreement.sow ?? {}).map(([k, v]) => (
                                    <div key={k} className="rounded-xl border-2 border-black bg-[#FFF6E9] px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <p className="font-mono text-xs font-black tracking-wide opacity-60">{k.toUpperCase()}</p>
                                        <p className="mt-1 text-sm font-medium">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={CARD}>
                            <div className="flex items-center justify-between">
                                <h2 className="font-black uppercase">Workspace</h2>
                                {editing && <span className="text-xs font-bold opacity-50">Editing</span>}
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
                                        <div key={key} className="flex items-center justify-between gap-4 rounded-xl border-2 border-black bg-[#FFF6E9] px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                            <span className="shrink-0 font-bold opacity-60">{label}</span>
                                            {editing ? (
                                                <div className="w-48">
                                                    <DatePicker value={form[key] ?? ''} onChange={(v) => setForm({ ...form, [key]: v })} placeholder="Pick a date" />
                                                </div>
                                            ) : (
                                                <span className="text-right font-bold">{agreement[key] ? new Date(agreement[key]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div key={key} className="flex items-center justify-between gap-4 rounded-xl border-2 border-black bg-[#FFF6E9] px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                            <span className="shrink-0 font-bold opacity-60">{label}</span>
                                            {editing ? (
                                                <input
                                                    type={type}
                                                    value={form[key] ?? ''}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    className="w-48 rounded-lg border-2 border-black bg-white px-2 py-1 text-right text-sm font-bold focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                                                />
                                            ) : (
                                                <span className="text-right font-bold">
                                                    {key === 'budget' && agreement[key] ? `$${agreement[key]}` : (agreement[key] ?? '—')}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                            {editing && (
                                <button onClick={handleSaveAndResend} disabled={saving} className={`${BTN_PRIMARY} mt-4 w-full py-2.5`}>
                                    {saving ? 'Saving…' : 'Save and resend'}
                                </button>
                            )}
                        </div>

                        <div className={CARD}>
                            <h2 className="font-black uppercase">Activity</h2>
                            <div className="mt-4 space-y-3">
                                {agreement.activities?.length ? (
                                    agreement.activities.map((act) => (
                                        <div key={act.id} className="flex gap-3">
                                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {act.action} <span className="font-mono opacity-50">· {new Date(act.created_at).toLocaleString()}</span>
                                                </p>
                                                <p className="font-mono text-xs opacity-50">{act.description} · {act.actor_wallet?.slice(0, 10)}…</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-bold opacity-50">No activity yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={CARD}>
                            <h3 className="font-black uppercase">On-chain</h3>
                            <dl className="mt-4 space-y-3 font-mono text-xs font-bold">
                                <div className="flex justify-between">
                                    <dt className="opacity-50">SOW hash</dt>
                                    <dd>{shortHash(agreement.sow_hash)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="opacity-50">Client</dt>
                                    <dd>{agreement.client_wallet.slice(0, 10)}…</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="opacity-50">Freelancer</dt>
                                    <dd>{agreement.freelancer_wallet ? agreement.freelancer_wallet.slice(0, 10) + '…' : '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="opacity-50">Chain</dt>
                                    <dd>{agreement.chain_id ?? (chainId === 968 ? '968 testnet' : chainId ? `${chainId}` : '—')}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="opacity-50">Tx</dt>
                                    <dd>
                                        {agreement.tx_hash ? (
                                            <a href={`${explorerBase}/tx/${agreement.tx_hash}`} target="_blank" rel="noreferrer" className="font-black text-emerald-600 hover:underline dark:text-emerald-300">
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
                                    className="mt-6 w-full rounded-xl border-2 border-black bg-[#B8F135] py-3 text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] disabled:opacity-50"
                                >
                                    {locking ? 'Locking…' : 'Lock on BOT Chain'}
                                </button>
                            ) : agreement.status === 'locked' ? (
                                <p className="mt-6 rounded-xl border-2 border-black bg-emerald-400 py-3 text-center text-sm font-black uppercase text-black">Locked</p>
                            ) : null}

                            {error && <p className="mt-3 text-xs font-bold text-red-600 dark:text-red-400">{error}</p>}
                        </div>

                        <div className={CARD}>
                            <h3 className="font-black uppercase">Escrow</h3>
                            <p className="mt-1 text-xs font-bold leading-relaxed opacity-60">Client funds are held by contract, released only when milestone is accepted.</p>
                            <div className="mt-4 space-y-2 font-mono text-xs font-bold">
                                <div className="flex justify-between"><span className="opacity-50">Budget</span><span>${agreement.budget ?? '—'}</span></div>
                                <div className="flex justify-between"><span className="opacity-50">Funded</span><span className="text-emerald-600 dark:text-emerald-300">${agreement.funded_amount ?? 0}</span></div>
                                <div className="flex justify-between"><span className="opacity-50">Status</span><span className="capitalize">{agreement.escrow_status}</span></div>
                                {agreement.escrow_tx_hash && <div className="flex justify-between"><span className="opacity-50">Fund tx</span><a href={`${explorerBase}/tx/${agreement.escrow_tx_hash}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline dark:text-emerald-300">{shortHash(agreement.escrow_tx_hash)}</a></div>}
                            </div>
                            {isClient && agreement.escrow_status === 'unfunded' && agreement.status !== 'draft' && (
                                <>
                                    <p className="mt-3 text-xs font-bold opacity-60">Click Fund will open MetaMask to pay 0.001 BOT to escrow (demo). Need BOT? https://faucet.botchain.ai/basic</p>
                                    <button onClick={handleFund} disabled={funding} className={`${BTN_PRIMARY} mt-3 w-full py-2.5`}>
                                        {funding ? 'Waiting for MetaMask…' : `Fund to escrow`}
                                    </button>
                                </>
                            )}
                            {agreement.escrow_status === 'funded' && <p className="mt-3 rounded-xl border-2 border-black bg-emerald-400 py-2 text-center text-xs font-black uppercase text-black">Funds in escrow — freelancer can submit</p>}
                        </div>

                        <div className={CARD}>
                            <h3 className="font-black uppercase">Cancellation</h3>
                            {agreement.status === 'cancelled' ? (
                                <p className="mt-3 text-sm font-bold opacity-60">This deal was ended by mutual agreement. No further actions are available.</p>
                            ) : !cancelCancellable ? (
                                <p className="mt-3 text-sm font-bold opacity-60">Only participants can request cancellation.</p>
                            ) : cancelRequestedBy === null ? (
                                <>
                                    <p className="mt-3 text-sm font-medium leading-relaxed opacity-60">
                                        Ending a deal needs both sides. Your request notifies the other party — the deal ends only after they approve.
                                    </p>
                                    <button
                                        onClick={handleRequestCancel}
                                        disabled={cancelling}
                                        className="mt-4 w-full rounded-xl border-2 border-red-500 bg-red-100 py-2.5 text-sm font-black uppercase text-red-700 transition-all hover:bg-red-200 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-300"
                                    >
                                        {cancelling ? 'Sending…' : 'Request cancellation'}
                                    </button>
                                </>
                            ) : iRequestedCancel ? (
                                <>
                                    <p className="mt-3 rounded-xl border-2 border-black bg-[#F2842F] px-3 py-2 text-sm font-black text-black">
                                        Waiting for the other party to approve your request.
                                    </p>
                                    <button
                                        onClick={handleWithdrawCancel}
                                        disabled={cancelling}
                                        className={`${BTN_GHOST} mt-4 w-full py-2.5`}
                                    >
                                        {cancelling ? 'Working…' : 'Withdraw request'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="mt-3 rounded-xl border-2 border-red-500 bg-red-100 px-3 py-2 text-sm font-black text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                        The other party requested cancellation of this deal.
                                    </p>
                                    <button
                                        onClick={handleApproveCancel}
                                        disabled={cancelling}
                                        className="mt-4 w-full rounded-xl border-2 border-black bg-red-500 py-2.5 text-sm font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] disabled:opacity-50"
                                    >
                                        {cancelling ? 'Working…' : 'Approve cancellation'}
                                    </button>
                                </>
                            )}
                        </div>

                        <div className={CARD}>
                            <h3 className="font-black uppercase">Milestones</h3>
                            {milestones.length === 0 ? (
                                <p className="mt-3 text-sm font-bold opacity-50">No milestones yet.</p>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {milestones.map((m) => (
                                        <div key={m.id} className="rounded-xl border-2 border-black bg-[#FFF6E9] p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-black">{m.title}</p>
                                                    <p className="font-mono text-xs font-bold opacity-50">${m.amount} · {m.status} · {m.escrow_status}</p>
                                                </div>
                                                <span className={`shrink-0 rounded-lg border-2 border-black px-2 py-1 text-xs font-black uppercase ${statusClass(m.status)}`}>{m.status}</span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {isFreelancer && ['pending', 'in_progress', 'unfunded'].includes(m.status) && m.escrow_status !== 'paid' && (
                                                    <button onClick={() => handleSubmitMilestone(m.id)} className="rounded-xl border-2 border-black bg-black px-4 py-1.5 text-xs font-black uppercase text-white dark:bg-white dark:text-black">Mark submitted</button>
                                                )}
                                                {isClient && m.status === 'submitted' && (
                                                    <>
                                                        <button onClick={() => handleApproveMilestone(m.id)} className="rounded-xl border-2 border-black bg-emerald-400 px-4 py-1.5 text-xs font-black uppercase text-black">Accept & release ${m.amount}</button>
                                                        <button onClick={() => handleRequestChangesMilestone(m.id)} className="rounded-xl border-2 border-black px-4 py-1.5 text-xs font-black uppercase dark:border-zinc-700">Request changes</button>
                                                    </>
                                                )}
                                                {m.escrow_status === 'paid' && <span className="text-xs font-black text-emerald-600 dark:text-emerald-300">Paid to freelancer</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isClient && (
                                <div className="mt-4 flex gap-2">
                                    <input value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} placeholder="Milestone title" className={`${INPUT} flex-1`} />
                                    <input value={newMilestone.amount} onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })} placeholder="$" type="number" className={`${INPUT} w-20`} />
                                    <button onClick={handleAddMilestone} className="rounded-xl border-2 border-black bg-black px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-black">Add</button>
                                </div>
                            )}
                        </div>

                        <div className={CARD}>
                            <p className="font-mono text-xs font-black opacity-50">BOT Chain</p>
                            <p className="mt-1 text-sm font-bold">Testnet 968 · Mainnet 677</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
