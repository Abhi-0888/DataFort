import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VaultPage from './pages/VaultPage';
import CredentialsPage from './pages/CredentialsPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import AuditLogPage from './pages/AuditLogPage';
import Layout from './components/ui/Layout';

/** Wrap authenticated routes — redirect to /login if not authed */
const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
};

/** Redirect authed users away from login/register */
const PublicRoute = ({ children }) => {
    const { token } = useAuth();
    return !token ? children : <Navigate to="/dashboard" replace />;
};

const App = () => (
    <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected — wrapped in sidebar Layout */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vaults" element={<VaultPage />} />
            <Route path="/credentials/:vaultId?" element={<CredentialsPage />} />
            <Route path="/documents/:vaultId?" element={<DocumentsPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
);

export default App;
