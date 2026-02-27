import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, FileText, Vault, Activity } from 'lucide-react';
import api from '../services/api';

const DashboardPage = () => {
    const { user } = useAuth();

    const { data: vaultData } = useQuery({
        queryKey: ['vaults'],
        queryFn: () => api.get('/vaults').then((r) => r.data),
    });

    const { data: auditData } = useQuery({
        queryKey: ['audit', 1],
        queryFn: () => api.get('/audit?limit=5').then((r) => r.data),
    });

    const vaults = vaultData?.vaults || [];
    const logs = auditData?.logs || [];

    const totalCredentials = vaults.reduce((s, v) => s + (v._count?.credentials || 0), 0);
    const totalDocuments = vaults.reduce((s, v) => s + (v._count?.documents || 0), 0);

    const stats = [
        { label: 'Vaults', value: vaults.length, icon: <Vault size={20} />, color: '#6366f1' },
        { label: 'Credentials', value: totalCredentials, icon: <KeyRound size={20} />, color: '#10b981' },
        { label: 'Documents', value: totalDocuments, icon: <FileText size={20} />, color: '#f59e0b' },
    ];

    return (
        <div className="page animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">
                    <Shield size={26} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
                    Dashboard
                </h1>
                <p className="page-subtitle">Welcome back, {user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: 32 }}>
                {stats.map(({ label, value, icon, color }) => (
                    <div key={label} className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 500 }}>{label}</span>
                            <span style={{ color, opacity: 0.8 }}>{icon}</span>
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                            {value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={16} style={{ color: 'var(--color-accent-secondary)' }} />
                    Recent Activity
                </h2>
                {logs.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                        No activity yet.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {logs.map((log) => (
                            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                <div>
                                    <span className="badge badge-accent">{log.action}</span>
                                    <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--color-text-secondary)' }}>{log.resource}</span>
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
