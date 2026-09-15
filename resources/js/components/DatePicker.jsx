import { useEffect, useRef, useState } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseISO(v) {
    if (!v) return null;
    const [y, m, d] = v.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export default function DatePicker({ value, onChange, placeholder = 'Pick a date' }) {
    const [open, setOpen] = useState(false);
    const [cursor, setCursor] = useState(() => parseISO(value) ?? new Date());
    const ref = useRef(null);

    useEffect(() => {
        if (value) {
            const p = parseISO(value);
            if (p) setCursor(p);
        }
    }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayISO = toISO(new Date());

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    const display = value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white hover:border-zinc-700 focus:border-zinc-600 focus:outline-none"
            >
                <span className={display ? 'text-white' : 'text-zinc-600'}>{display || placeholder}</span>
                <CalendarDaysIcon className="size-5 shrink-0 text-zinc-500" />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                            <ChevronLeftIcon className="size-5" />
                        </button>
                        <span className="text-sm font-medium text-white">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                            <ChevronRightIcon className="size-5" />
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-7 gap-1 text-center font-mono text-xs text-zinc-500">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <span key={d} className="py-1">
                                {d}
                            </span>
                        ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {cells.map((date, i) =>
                            date ? (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        onChange(toISO(date));
                                        setOpen(false);
                                    }}
                                    className={`rounded-lg py-1.5 text-sm ${
                                        value === toISO(date)
                                            ? 'bg-white font-semibold text-zinc-950'
                                            : toISO(date) === todayISO
                                              ? 'border border-zinc-700 text-white hover:bg-zinc-800'
                                              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                    }`}
                                >
                                    {date.getDate()}
                                </button>
                            ) : (
                                <span key={i} />
                            ),
                        )}
                    </div>

                    <div className="mt-3 flex justify-between">
                        <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="text-xs text-zinc-500 hover:text-white">
                            Clear
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-400 hover:text-white">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
