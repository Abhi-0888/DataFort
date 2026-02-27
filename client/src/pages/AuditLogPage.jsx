import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ClipboardList, Shield } from 'lucide-react';
import api from '../services/api';

const AuditLogPage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['audit'],
        queryFn: () => api.get('/audit?limit=50').then((r) => r.data),
    });

    const logs = data?.logs || [];

    const actionColors = {
        CREDENTIAL_LIST: 'badge-accent',
        CREDENTIAL_CREATE: 'badge-success',
        CREDENTIAL_UPDATE: 'badge-warning',
        CREDENTIAL_DELETE: 'badge-danger',
        DOCUMENT_LIST: 'badge-accent',
        DOCUMENT_UPLOAD: 'badge-success',
        DOCUMENT_DOWNLOAD: 'badge-accent',
        DOCUMENT_DELETE: 'badge-danger',
    };

    return (
        <div className="page animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">
                    <ClipboardList size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
                    Audit Log
                </h1>
                <p className="page-subtitle">Immutable history of all sensitive operations</p>
            </div>

            <div className="card" style={{ padding: 24 }}>
                {isLoading ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>Loading…</p>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Shield size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--color-text-secondary)' }}>No activity recorded yet.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['Action', 'Resource', 'IP Address', 'Timestamp'].map((h) => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0 12px 12px', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`badge ${actionColors[log.action] || 'badge-accent'}`}>{log.action}</span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{log.resource}</td>
                                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-muted)' }}>{log.ipAddress || '—'}</td>
                                    <td style={{ padding: '12px', fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AuditLogPage;
