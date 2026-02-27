import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Vault, Plus, Trash2, Edit3, X } from 'lucide-react';
import api from '../services/api';

const VaultPage = () => {
    const qc = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editVault, setEditVault] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['vaults'],
        queryFn: () => api.get('/vaults').then((r) => r.data),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const createMutation = useMutation({
        mutationFn: (body) => api.post('/vaults', body).then((r) => r.data),
        onSuccess: () => { qc.invalidateQueries(['vaults']); setShowModal(false); reset(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/vaults/${id}`),
        onSuccess: () => qc.invalidateQueries(['vaults']),
    });

    const onSubmit = (data) => createMutation.mutate(data);

    const vaults = data?.vaults || [];

    return (
        <div className="page animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Vaults</h1>
                    <p className="page-subtitle">Organize your secrets into named vaults</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> New Vault
                </button>
            </div>

            {isLoading ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Loading vaults…</p>
            ) : vaults.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <Vault size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>No vaults yet</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 6 }}>Create a vault to start storing secrets safely.</p>
                </div>
            ) : (
                <div className="grid-2">
                    {vaults.map((v) => (
                        <div key={v.id} className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <Vault size={18} style={{ color: v.color || 'var(--color-accent-primary)' }} />
                                        <span style={{ fontWeight: 600, fontSize: 16 }}>{v.name}</span>
                                    </div>
                                    {v.description && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{v.description}</p>}
                                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                        <span className="badge badge-accent">{v._count?.credentials || 0} credentials</span>
                                        <span className="badge badge-success">{v._count?.documents || 0} docs</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => deleteMutation.mutate(v.id)}>
                                        <Trash2 size={15} style={{ color: 'var(--color-danger)' }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Vault Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>New Vault</h2>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label>Vault Name</label>
                                <input className="input" placeholder="e.g. Work Credentials" {...register('name', { required: true })} />
                            </div>
                            <div className="form-group">
                                <label>Description (optional)</label>
                                <input className="input" placeholder="Brief description…" {...register('description')} />
                            </div>
                            <button type="submit" className="btn btn-primary w-full" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating…' : 'Create Vault'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaultPage;
