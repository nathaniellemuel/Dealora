import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

export default function Gate() {
    const { address, chainId, isConnected, isCorrectNetwork, connect, connecting, error, clearError, switchToBotTestnet } =
        useWallet();
    const { user, isAuthed, loginWithWallet, loading } = useAuth();
    const navigate = useNavigate();
    const [switching, setSwitching] = useState(false);
    const [signing, setSigning] = useState(false);
    const [localError, setLocalError] = useState(null);

    const walletLabel = isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected';
    const networkLabel =
        !isConnected ? '—' : isCorrectNetwork ? (chainId === 968 ? 'BOT Testnet' : 'BOT Mainnet') : 'Wrong network';
    const accessLabel = !isConnected ? 'Locked' : !isCorrectNetwork ? 'Wrong network' : !isAuthed ? 'Ready' : 'Unlocked';

    const handleSwitch = async () => {
        setLocalError(null);
        clearError();
        setSwitching(true);
        const ok = await switchToBotTestnet();
        setSwitching(false);
        if (!ok) setLocalError('Switch failed. Open MetaMask and switch to BOT Chain Testnet (968) manually.');
    };

    const handleContinue = async () => {
        setLocalError(null);
        if (!isConnected || !isCorrectNetwork) return;
        if (!isAuthed) {
            setSigning(true);
            try {
                await loginWithWallet(address);
            } catch (e) {
                setLocalError(e.message);
                setSigning(false);
                return;
            }
            setSigning(false);
        }
        // re-read role after login
        const raw = localStorage.getItem('dealora_user');
        const u = raw ? JSON.parse(raw) : user;
        if (!u?.role) navigate('/app/role');
        else navigate('/app/dashboard');
    };

    const displayError = localError || error;

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 55% 45% at 75% 30%, rgba(52,211,153,0.09), transparent 70%), radial-gradient(ellipse 45% 40% at 15% 85%, rgba(255,255,255,0.05), transparent 70%)',
                }}
            />

            <header className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link to="/" className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-white text-lg font-semibold text-zinc-950">
                        D
                    </span>
                    <span className="text-base font-semibold tracking-tight">Dealora</span>
                </Link>
                <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">Access</span>
            </header>

            <div className="relative flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <h1 className="text-center text-3xl font-semibold tracking-tight text-white">Sign in</h1>

                    <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                        <div className="divide-y divide-zinc-800">
                            <div className="flex items-center justify-between gap-4 px-5 py-4">
                                <div>
                                    <p className="text-xs font-medium text-zinc-400">Wallet</p>
                                    <p className={`mt-1 font-mono text-sm ${isConnected ? 'text-white' : 'text-zinc-500'}`}>{walletLabel}</p>
                                </div>
                                {!isConnected ? (
                                    <button
                                        onClick={connect}
                                        disabled={connecting}
                                        className="rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
                                    >
                                        {connecting ? 'Connecting…' : 'Connect'}
                                    </button>
                                ) : (
                                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Connected</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4 px-5 py-4">
                                <div>
                                    <p className="text-xs font-medium text-zinc-400">Network</p>
                                    <p className={`mt-1 text-sm ${isCorrectNetwork ? 'text-white' : isConnected ? 'text-amber-300' : 'text-zinc-500'}`}>
                                        {networkLabel}
                                    </p>
                                </div>
                                {isConnected && !isCorrectNetwork && (
                                    <button
                                        onClick={handleSwitch}
                                        disabled={switching}
                                        className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-400 hover:text-white disabled:opacity-50"
                                    >
                                        {switching ? 'Switching…' : 'Switch to BOT'}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4 px-5 py-4">
                                <div>
                                    <p className="text-xs font-medium text-zinc-400">Access</p>
                                    <p className={`mt-1 text-sm ${accessLabel === 'Unlocked' ? 'text-emerald-300' : 'text-zinc-500'}`}>{accessLabel}</p>
                                </div>
                                {isConnected && isCorrectNetwork && (
                                    <button
                                        onClick={handleContinue}
                                        disabled={signing || loading}
                                        className={`rounded-full px-6 py-2 text-sm font-medium disabled:opacity-50 ${isAuthed ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'border border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white'}`}
                                    >
                                        {signing || loading ? 'Signing…' : isAuthed ? 'Continue' : 'Sign in'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {displayError && <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{displayError}</p>}

                    <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-relaxed text-zinc-500">No funds move. Only reads your address and network.</p>
                </div>
            </div>
        </div>
    );
}
