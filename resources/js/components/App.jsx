import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from '../contexts/WalletContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import AppLayout from './AppLayout';
import Landing from '../pages/Landing';
import Gate from '../pages/Gate';
import RoleSelect from '../pages/RoleSelect';
import Dashboard from '../pages/Dashboard';
import Agreements from '../pages/Agreements';
import CreateAgreement from '../pages/CreateAgreement';
import AgreementDetail from '../pages/AgreementDetail';
import Settings from '../pages/Settings';

function Protected({ children }) {
    const { isConnected, initialized } = useWallet();
    const { isAuthed, user, loading } = useAuth();
    if (!initialized || loading) return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">Loading…</div>;
    if (!isConnected || !isAuthed) return <Navigate to="/app" replace />;
    if (!user?.role) return <Navigate to="/app/role" replace />;
    return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
    const { isConnected, initialized } = useWallet();
    const { isAuthed, user, loading } = useAuth();

    if (!initialized) return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">Loading…</div>;

    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route
                path="/app"
                element={
                    !isConnected || !isAuthed ? (
                        <Gate />
                    ) : !user?.role ? (
                        <Navigate to="/app/role" replace />
                    ) : (
                        <Navigate to="/app/dashboard" replace />
                    )
                }
            />
            <Route
                path="/app/role"
                element={
                    !isConnected || !isAuthed ? (
                        <Navigate to="/app" replace />
                    ) : (
                        <RoleSelect />
                    )
                }
            />
            <Route
                path="/app/dashboard"
                element={
                    <Protected>
                        <Dashboard />
                    </Protected>
                }
            />
            <Route
                path="/app/agreements"
                element={
                    <Protected>
                        <Agreements />
                    </Protected>
                }
            />
            <Route
                path="/app/settings"
                element={
                    <Protected>
                        <Settings />
                    </Protected>
                }
            />
            <Route
                path="/app/create"
                element={
                    <Protected>
                        <CreateAgreement />
                    </Protected>
                }
            />
            <Route
                path="/app/agreements/:id"
                element={
                    <Protected>
                        <AgreementDetail />
                    </Protected>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <WalletProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </WalletProvider>
        </BrowserRouter>
    );
}
