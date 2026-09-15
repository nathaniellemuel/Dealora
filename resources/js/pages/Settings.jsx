import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
    const { user, setRole } = useAuth();

    return (
        <div>
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6">
                <h1 className="text-xl font-semibold tracking-tight text-white">Settings</h1>
                <span className="font-mono text-xs text-zinc-500">{user?.wallet_address?.slice(0, 10)}…</span>
            </div>

            <div className="max-w-5xl px-4 py-8 sm:px-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-sm font-semibold tracking-wide text-zinc-200">Role</h2>
                    <p className="mt-1 text-sm text-zinc-500">Current: <span className="capitalize text-white">{user?.role ?? 'not set'}</span></p>
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={() => setRole('client')}
                            className={`rounded-full px-5 py-2 text-sm font-medium ${user?.role === 'client' ? 'bg-white text-zinc-950' : 'border border-zinc-800 text-zinc-300 hover:border-zinc-600'}`}
                        >
                            Client
                        </button>
                        <button
                            onClick={() => setRole('freelancer')}
                            className={`rounded-full px-5 py-2 text-sm font-medium ${user?.role === 'freelancer' ? 'bg-white text-zinc-950' : 'border border-zinc-800 text-zinc-300 hover:border-zinc-600'}`}
                        >
                            Freelancer
                        </button>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                    <p className="font-mono text-xs tracking-wide text-zinc-500">WALLET</p>
                    <p className="mt-2 break-all font-mono text-sm text-white">{user?.wallet_address}</p>
                    <p className="mt-3 font-mono text-xs text-zinc-600">BOT Chain · Testnet 968 · Mainnet 677</p>
                </div>
            </div>
        </div>
    );
}
