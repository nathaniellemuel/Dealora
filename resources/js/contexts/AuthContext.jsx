import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useWallet } from './WalletContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { address, chainId } = useWallet();
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('dealora_user');
        return raw ? JSON.parse(raw) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('dealora_token'));
    const [loading, setLoading] = useState(false);

    const isAuthed = Boolean(user && token && address && user.wallet_address === address.toLowerCase());

    const loginWithWallet = useCallback(
        async (walletAddress, role) => {
            setLoading(true);
            try {
                const res = await fetch('/api/auth/wallet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ wallet_address: walletAddress, role, chain_id: chainId }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message ?? 'Login failed');
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('dealora_user', JSON.stringify(data.user));
                localStorage.setItem('dealora_token', data.token);
                return data;
            } finally {
                setLoading(false);
            }
        },
        [chainId],
    );

    const setRole = useCallback(
        async (role) => {
            if (!token) return;
            const res = await fetch('/api/me/role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('dealora_user', JSON.stringify(data));
            }
            return data;
        },
        [token],
    );

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('dealora_user');
        localStorage.removeItem('dealora_token');
    }, []);

    // auto login when wallet changes and no user yet
    useEffect(() => {
        if (address && !isAuthed && !loading && !user) {
            loginWithWallet(address, null).catch(() => {});
        }
    }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthed, loginWithWallet, setRole, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}

export function authHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}
