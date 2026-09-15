import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const BOT_NETWORKS = {
    968: {
        chainId: '0x3C8',
        chainIdDec: 968,
        chainName: 'BOT Chain Testnet',
        rpcUrls: ['https://rpc.bohr.life'],
        nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
        blockExplorerUrls: ['https://scan.bohr.life/'],
    },
    677: {
        chainId: '0x2A5',
        chainIdDec: 677,
        chainName: 'BOT Chain Mainnet',
        rpcUrls: ['https://rpc.botchain.ai'],
        nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
        blockExplorerUrls: ['https://scan.botchain.ai'],
    },
};

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const [address, setAddress] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(null);

    const isConnected = Boolean(address);
    const isCorrectNetwork = chainId === 968 || chainId === 677;
    const network = chainId ? BOT_NETWORKS[chainId] : null;

    const shortAddress = useMemo(() => {
        if (!address) return null;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }, [address]);

    const updateFromProvider = useCallback(async () => {
        if (!window.ethereum) {
            setInitialized(true);
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts[0]) setAddress(accounts[0]);
            const cid = await window.ethereum.request({ method: 'eth_chainId' });
            if (cid) setChainId(parseInt(cid, 16));
        } catch {
            // ignore
        } finally {
            setInitialized(true);
        }
    }, []);

    useEffect(() => {
        updateFromProvider();
        if (!window.ethereum) return;
        const handleAccounts = (accs) => setAddress(accs[0] ?? null);
        const handleChain = (cid) => setChainId(parseInt(cid, 16));
        window.ethereum.on?.('accountsChanged', handleAccounts);
        window.ethereum.on?.('chainChanged', handleChain);
        return () => {
            window.ethereum.removeListener?.('accountsChanged', handleAccounts);
            window.ethereum.removeListener?.('chainChanged', handleChain);
        };
    }, [updateFromProvider]);

    const connect = useCallback(async () => {
        setError(null);
        if (!window.ethereum) {
            setError('MetaMask not found. Install it from metamask.io');
            return false;
        }
        setConnecting(true);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAddress(accounts[0]);
            const cid = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(cid, 16));
            return true;
        } catch (e) {
            setError(e?.message ?? 'Connection rejected');
            return false;
        } finally {
            setConnecting(false);
        }
    }, []);

    const switchToBotTestnet = useCallback(async () => {
        setError(null);
        if (!window.ethereum) {
            setError('MetaMask not found');
            return false;
        }
        const net = BOT_NETWORKS[968];
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: net.chainId }],
            });
            const cid = await window.ethereum.request({ method: 'eth_chainId' });
            if (cid) setChainId(parseInt(cid, 16));
            return true;
        } catch (e) {
            if (e?.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [net],
                    });
                    const cid = await window.ethereum.request({ method: 'eth_chainId' });
                    if (cid) setChainId(parseInt(cid, 16));
                    return true;
                } catch (err) {
                    setError(err?.message ?? 'Failed to add BOT Chain');
                    return false;
                }
            }
            if (e?.code === 4001) {
                setError('Switch rejected in MetaMask');
            } else {
                setError(e?.message ?? 'Failed to switch network');
            }
            return false;
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value = {
        address,
        chainId,
        network,
        shortAddress,
        isConnected,
        isCorrectNetwork,
        connecting,
        initialized,
        error,
        clearError,
        connect,
        switchToBotTestnet,
        BOT_NETWORKS,
    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
    const ctx = useContext(WalletContext);
    if (!ctx) throw new Error('useWallet must be inside WalletProvider');
    return ctx;
}
