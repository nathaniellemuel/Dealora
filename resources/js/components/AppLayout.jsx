import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    Squares2X2Icon,
    DocumentTextIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    PlusIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const NAV = [
    { to: '/app/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { to: '/app/agreements', label: 'Agreements', icon: DocumentTextIcon },
    { to: '/app/settings', label: 'Settings', icon: Cog6ToothIcon },
];

function ThemeButton({ className = '' }) {
    const { theme, toggle } = useTheme();
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className={`rounded-lg border-2 border-black bg-white p-1.5 text-black shadow-[3px_3px_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[3px_3px_0_rgba(255,255,255,0.7)] ${className}`}
        >
            {theme === 'dark' ? <SunIcon className="size-5" strokeWidth={2.2} /> : <MoonIcon className="size-5" strokeWidth={2.2} />}
        </button>
    );
}

export default function AppLayout({ children }) {
    const { logout, user } = useAuth();
    const [drawer, setDrawer] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#FFF6E9] font-sans text-black antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-100">
            <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-black bg-[#FFF6E9] dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
                <div className="flex h-16 items-center gap-2.5 border-b-2 border-black bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <span className="flex size-8 items-center justify-center rounded-lg border-2 border-black bg-black text-lg font-black text-[#B8F135]">D</span>
                    <span className="font-black uppercase">Dealora</span>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm font-bold ${
                                    isActive
                                        ? 'border-black bg-black text-white shadow-[3px_3px_0_#B8F135] dark:border-white dark:bg-white dark:text-black dark:shadow-[3px_3px_0_#B8F135]'
                                        : 'border-transparent hover:bg-yellow-200/60 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="size-5" strokeWidth={2.2} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t-2 border-black p-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg border-2 border-black bg-white px-3 py-1 text-xs font-black capitalize dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{user?.role ?? 'both'}</span>
                        <div className="flex items-center gap-2">
                            <ThemeButton />
                            <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs font-bold opacity-60 hover:opacity-100">
                                <ArrowLeftOnRectangleIcon className="size-4" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* mobile drawer */}
            <div
                aria-hidden
                onClick={() => setDrawer(false)}
                className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden ${drawer ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            />
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-black bg-[#FFF6E9] shadow-[8px_0_0_#000] transition-transform duration-300 ease-out dark:bg-zinc-950 lg:hidden ${drawer ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex h-16 items-center justify-between border-b-2 border-black px-4 dark:border-zinc-800">
                    <Link to="/app/dashboard" onClick={() => setDrawer(false)} className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg border-2 border-black bg-black text-lg font-black text-[#B8F135]">D</span>
                        <span className="font-black uppercase">Dealora</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeButton />
                        <button
                            type="button"
                            onClick={() => setDrawer(false)}
                            aria-label="Close menu"
                            className="rounded-lg border-2 border-black bg-white p-1.5 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        >
                            <XMarkIcon className="size-5" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <Link
                        to="/app/create"
                        onClick={() => setDrawer(false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-[#F2842F] px-4 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000]"
                    >
                        <PlusIcon className="size-4" strokeWidth={3} />
                        New deal
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 px-4">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setDrawer(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-black uppercase ${
                                    isActive
                                        ? 'border-black bg-black text-white shadow-[3px_3px_0_#B8F135] dark:border-white dark:bg-white dark:text-black'
                                        : 'border-transparent opacity-70 hover:bg-yellow-200/60 hover:opacity-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="size-5" strokeWidth={2.4} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t-2 border-black p-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <span className="rounded-lg border-2 border-black bg-white px-3 py-1 text-xs font-black capitalize dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{user?.role ?? 'both'}</span>
                        <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs font-bold opacity-60 hover:opacity-100">
                            <ArrowLeftOnRectangleIcon className="size-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 items-center justify-between border-b-2 border-black bg-[#FFF6E9] px-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
                    <Link to="/app/dashboard" className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg border-2 border-black bg-black text-base font-black text-[#B8F135]">D</span>
                        <span className="font-black uppercase">Dealora</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeButton className="!p-1" />
                        <button
                            type="button"
                            onClick={() => setDrawer(true)}
                            aria-label="Open menu"
                            className="rounded-lg border-2 border-black bg-white p-1 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        >
                            <Bars3Icon className="size-6" strokeWidth={2} />
                        </button>
                    </div>
                </header>
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
