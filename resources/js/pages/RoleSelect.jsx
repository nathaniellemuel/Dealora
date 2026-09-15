import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RoleSelect() {
    const { user, setRole } = useAuth();
    const navigate = useNavigate();

    const pick = async (role) => {
        await setRole(role);
        navigate('/app/dashboard');
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100">
            <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    <h1 className="text-3xl font-semibold tracking-tight">Choose role</h1>
                    <p className="mt-2 font-mono text-xs text-zinc-500">{user?.wallet_address}</p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <button
                            onClick={() => pick('client')}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left hover:border-zinc-600"
                        >
                            <p className="text-lg font-semibold text-white">Client</p>
                            <p className="mt-2 text-sm text-zinc-400">Create and send agreements.</p>
                        </button>

                        <button
                            onClick={() => pick('freelancer')}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left hover:border-zinc-600"
                        >
                            <p className="text-lg font-semibold text-white">Freelancer</p>
                            <p className="mt-2 text-sm text-zinc-400">Review and deliver.</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
