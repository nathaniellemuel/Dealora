import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, WalletIcon, GlobeAltIcon, LockOpenIcon } from '@heroicons/react/24/outline';

export default function Gate() {
    const { address, chainId, isConnected, isCorrectNetwork, connect, connecting, error, clearError, switchToBotTestnet } =
        useWallet();
    const { user, isAuthed, loginWithWallet, loading } = useAuth();
    const navigate = useNavigate();
    const [switching, setSwitching] = useState(false);
    const [signing, setSigning] = useState(false);
    const [localError, setLocalError] = useState(null);
    const { theme, toggle: toggleTheme } = useTheme();

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

    const steps = [
        { icon: WalletIcon, color: 'bg-[#F2842F]', title: 'Wallet', done: isConnected },
        { icon: GlobeAltIcon, color: 'bg-sky-300', title: 'Network', done: isConnected && isCorrectNetwork },
        { icon: LockOpenIcon, color: 'bg-[#B8F135]', title: 'Access', done: isAuthed },
    ];

    return (
        <div className={theme === 'dark' ? 'dark' : ''}>
            <div className="relative flex min-h-screen flex-col bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-[#141210] dark:text-[#FFF6E9]">
                <header className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-lg border-2 border-black bg-black text-lg font-black text-[#B8F135] dark:border-white">
                            D
                        </span>
                        <span className="text-lg font-black uppercase tracking-tight">Dealora</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="rounded-lg border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] dark:border-white">
                            Access
                        </span>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="rounded-lg border-2 border-black bg-white p-1.5 text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] dark:border-white dark:bg-zinc-900 dark:text-white"
                        >
                            {theme === 'dark' ? <SunIcon className="size-5" strokeWidth={2.2} /> : <MoonIcon className="size-5" strokeWidth={2.2} />}
                        </button>
                    </div>
                </header>

                <div className="relative flex flex-1 items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <p className="mx-auto w-fit rounded-full border-2 border-black bg-pink-300 px-4 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]">
                            3 steps to enter
                        </p>
                        <h1 className="mt-4 text-center text-3xl font-black uppercase tracking-tight sm:text-4xl">Sign in</h1>
                        <p className="mt-2 text-center text-sm font-bold opacity-70">Connect wallet, pick the network, unlock access.</p>

                        <div className="mt-6 flex justify-center gap-2">
                            {steps.map((s, i) => (
                                <div key={s.title} className="flex items-center gap-2">
                                    <span
                                        className={`flex size-9 items-center justify-center rounded-lg border-2 border-black shadow-[3px_3px_0_#000] ${s.done ? `${s.color} text-black` : 'bg-white text-black dark:bg-zinc-900 dark:text-white dark:shadow-[3px_3px_0_rgba(255,255,255,0.7)]'}`}
                                    >
                                        <s.icon className="size-5" strokeWidth={2.4} />
                                    </span>
                                    {i < steps.length - 1 && <span className="h-0.5 w-6 bg-current opacity-30" />}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-black bg-white text-black shadow-[6px_6px_0_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[6px_6px_0_rgba(255,255,255,0.85)]">
                            <div className="divide-y-2 divide-black dark:divide-white">
                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div>
                                        <p className="text-xs font-black uppercase opacity-60">Wallet</p>
                                        <p className={`mt-1 font-mono text-sm font-bold ${isConnected ? '' : 'opacity-50'}`}>{walletLabel}</p>
                                    </div>
                                    {!isConnected ? (
                                        <button
                                            onClick={connect}
                                            disabled={connecting}
                                            className="rounded-xl border-2 border-black bg-black px-5 py-2 text-sm font-black uppercase text-white shadow-[3px_3px_0_#B8F135] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B8F135] disabled:opacity-50"
                                        >
                                            {connecting ? 'Connecting…' : 'Connect'}
                                        </button>
                                    ) : (
                                        <span className="rounded-lg border-2 border-black bg-emerald-400 px-3 py-1 text-xs font-black uppercase text-black">Connected</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div>
                                        <p className="text-xs font-black uppercase opacity-60">Network</p>
                                        <p className={`mt-1 text-sm font-black ${isCorrectNetwork ? '' : isConnected ? 'text-[#F2842F]' : 'opacity-50'}`}>
                                            {networkLabel}
                                        </p>
                                    </div>
                                    {isConnected && !isCorrectNetwork && (
                                        <button
                                            onClick={handleSwitch}
                                            disabled={switching}
                                            className="rounded-xl border-2 border-black bg-[#F2842F] px-4 py-2 text-sm font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] disabled:opacity-50"
                                        >
                                            {switching ? 'Switching…' : 'Switch to BOT'}
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div>
                                        <p className="text-xs font-black uppercase opacity-60">Access</p>
                                        <p className={`mt-1 text-sm font-black ${accessLabel === 'Unlocked' ? 'text-emerald-500' : 'opacity-50'}`}>{accessLabel}</p>
                                    </div>
                                    {isConnected && isCorrectNetwork && (
                                        <button
                                            onClick={handleContinue}
                                            disabled={signing || loading}
                                            className="rounded-xl border-2 border-black bg-[#B8F135] px-6 py-2 text-sm font-black uppercase text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] disabled:opacity-50"
                                        >
                                            {signing || loading ? 'Signing…' : isAuthed ? 'Continue' : 'Sign in'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {displayError && <p className="mt-4 rounded-xl border-2 border-black bg-red-300 px-4 py-3 text-sm font-bold text-black shadow-[4px_4px_0_#000]">{displayError}</p>}

                        <p className="mx-auto mt-6 max-w-sm text-center text-xs font-bold leading-relaxed opacity-60">No funds move. Only reads your address and network.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
