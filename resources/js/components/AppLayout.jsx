import { NavLink, Link } from 'react-router-dom';
import { Squares2X2Icon, DocumentTextIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
    { to: '/app/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { to: '/app/agreements', label: 'Agreements', icon: DocumentTextIcon },
    { to: '/app/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function AppLayout({ children }) {
    const { logout, user } = useAuth();

    return (
        <div className="flex min-h-screen bg-zinc-950 font-sans text-zinc-100">
            <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
                <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 bg-zinc-900/50 px-6">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-white text-lg font-semibold text-zinc-950">D</span>
                    <span className="font-semibold">Dealora</span>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`
                            }
                        >
                            <item.icon className="size-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t border-zinc-800 p-4">
                    <div className="flex items-center justify-between">
                        <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs capitalize text-zinc-300">{user?.role ?? 'no role'}</span>
                        <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white">
                            <ArrowLeftOnRectangleIcon className="size-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 lg:hidden">
                    <Link to="/app/dashboard" className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-white text-base font-semibold text-zinc-950">D</span>
                        <span className="font-semibold">Dealora</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/app/agreements" className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                            Agreements
                        </Link>
                        <button onClick={logout} className="text-xs text-zinc-500">
                            Sign out
                        </button>
                    </div>
                </header>
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
