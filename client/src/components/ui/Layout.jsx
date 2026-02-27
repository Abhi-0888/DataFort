import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Vault, KeyRound, FileText,
    ClipboardList, Settings, LogOut, Shield,
} from 'lucide-react';
import './Layout.css';

const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/vaults', icon: <Vault size={18} />, label: 'Vaults' },
    { to: '/credentials', icon: <KeyRound size={18} />, label: 'Credentials' },
    { to: '/documents', icon: <FileText size={18} />, label: 'Documents' },
    { to: '/audit', icon: <ClipboardList size={18} />, label: 'Audit Log' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
];

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-logo"><Shield size={22} /></div>
                    <span className="sidebar-title">DataFort</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            {icon}
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                        <span className="sidebar-email">{user?.email}</span>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
