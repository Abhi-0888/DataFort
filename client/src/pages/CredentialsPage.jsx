import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { KeyRound, Plus, Eye, EyeOff, Trash2, X, Copy } from 'lucide-react';
import api from '../services/api';

const CredentialsPage = () => {
    const { vaultId } = useParams();
    const qc = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [visibleIds, setVisibleIds] = useState({});
    const [form, setForm] = useState({ vaultId: vaultId || '', label: '', url: '', encryptedUsername: '', encryptedPassword: '', encryptedNotes: '', iv: 'placeholder-iv', authTag: 'placeholder-tag' });

    const { data: vaultData } = useQuery({ queryKey: ['vaults'], queryFn: () => api.get('/vaults').then(r => r.data) });
    const selectedVault = form.vaultId || vaultData?.vaults?.[0]?.id;

    const { data, isLoading } = useQuery({
        queryKey: ['credentials', selectedVault],
        queryFn: () => selectedVault ? api.get(`/credentials/vault/${selectedVault}`).then(r => r.data) : null,
        enabled: !!selectedVault,
    });

    const createMutation = useMutation({
        mutationFn: (body) => api.post('/credentials', body).then(r => r.data),
        onSuccess: () => { qc.invalidateQueries(['credentials', selectedVault]); setShowModal(false); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/credentials/${id}`),
        onSuccess: () => qc.invalidateQueries(['credentials', selectedVault]),
    });

    const credentials = data?.credentials || [];

    return (
        <div className="page animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title"><KeyRound size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />Credentials</h1>
                    <p className="page-subtitle">Encrypted usernames, passwords, and notes</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!vaultData?.vaults?.length}>
                    <Plus size={16} /> Add Credential
                </button>
            </div>

            {!vaultData?.vaults?.length ? (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>Create a vault first to store credentials.</p>
                </div>
            ) : credentials.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <KeyRound size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>No credentials in this vault yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {credentials.map((c) => (
                        <div key={c.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 15 }}>{c.label}</p>
                                {c.url && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{c.url}</p>}
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6, fontFamily: 'monospace' }}>
                                    {visibleIds[c.id] ? c.encryptedUsername : '••••••••'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setVisibleIds(p => ({ ...p, [c.id]: !p[c.id] }))}>
                                    {visibleIds[c.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => deleteMutation.mutate(c.id)}>
                                    <Trash2 size={15} style={{ color: 'var(--color-danger)' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Add Credential</h2>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label>Vault</label>
                                <select className="input" value={form.vaultId} onChange={e => setForm(p => ({ ...p, vaultId: e.target.value }))}>
                                    {vaultData?.vaults?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Label</label>
                                <input className="input" placeholder="e.g. GitHub Account" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>URL (optional)</label>
                                <input className="input" placeholder="https://github.com" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input className="input" placeholder="Username or email" value={form.encryptedUsername} onChange={e => setForm(p => ({ ...p, encryptedUsername: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input className="input" type="password" placeholder="Password" value={form.encryptedPassword} onChange={e => setForm(p => ({ ...p, encryptedPassword: e.target.value }))} />
                            </div>
                            <button className="btn btn-primary w-full" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Saving…' : 'Save Credential'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CredentialsPage;
