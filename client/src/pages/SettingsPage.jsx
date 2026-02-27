import { useAuth } from '../context/AuthContext';
import { Settings, Shield, User, Lock } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div className="page animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">
                    <Settings size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
                    Settings
                </h1>
                <p className="page-subtitle">Manage your account and security preferences</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
                {/* Account Info */}
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <User size={16} style={{ color: 'var(--color-accent-secondary)' }} />
                        Account
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Email</span>
                            <span style={{ color: 'var(--color-text-primary)', fontSize: 13 }}>{user?.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Account ID</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 12, fontFamily: 'monospace' }}>{user?.id}</span>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <Shield size={16} style={{ color: 'var(--color-accent-secondary)' }} />
                        Security
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 500 }}>MFA (Two-Factor Auth)</p>
                                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Adds an extra layer of protection</p>
                            </div>
                            <span className="badge badge-warning">Coming Soon</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 500 }}>Zero-Knowledge Encryption</p>
                                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>AES-256-GCM via Web Crypto API</p>
                            </div>
                            <span className="badge badge-success">Active</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="card" style={{ padding: 24, borderColor: 'rgba(239,68,68,0.2)' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, color: 'var(--color-danger)' }}>
                        <Lock size={16} />
                        Danger Zone
                    </h2>
                    <button className="btn btn-danger">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
