import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { FileText, Upload, Trash2, Download, X } from 'lucide-react';
import api from '../services/api';

const DocumentsPage = () => {
    const { vaultId } = useParams();
    const qc = useQueryClient();
    const [selectedVaultId, setSelectedVaultId] = useState(vaultId || '');
    const [showUpload, setShowUpload] = useState(false);
    const fileRef = useRef(null);

    const { data: vaultData } = useQuery({ queryKey: ['vaults'], queryFn: () => api.get('/vaults').then(r => r.data) });
    const activeVault = selectedVaultId || vaultData?.vaults?.[0]?.id;

    const { data, isLoading } = useQuery({
        queryKey: ['documents', activeVault],
        queryFn: () => activeVault ? api.get(`/documents/vault/${activeVault}`).then(r => r.data) : null,
        enabled: !!activeVault,
    });

    const deleteMutation = useMutation({
        mutationFn: id => api.delete(`/documents/${id}`),
        onSuccess: () => qc.invalidateQueries(['documents', activeVault]),
    });

    const uploadMutation = useMutation({
        mutationFn: async () => {
            const file = fileRef.current?.files?.[0];
            if (!file || !activeVault) return;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('vaultId', activeVault);
            // NOTE: In production, encrypt file client-side before upload
            formData.append('iv', 'placeholder-iv');
            formData.append('authTag', 'placeholder-tag');
            await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        onSuccess: () => { qc.invalidateQueries(['documents', activeVault]); setShowUpload(false); },
    });

    const documents = data?.documents || [];
    const fmtSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

    return (
        <div className="page animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title"><FileText size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />Documents</h1>
                    <p className="page-subtitle">Encrypted file storage — only you can decrypt</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowUpload(true)} disabled={!activeVault}>
                    <Upload size={16} /> Upload File
                </button>
            </div>

            {/* Vault selector */}
            {vaultData?.vaults?.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                    <select className="input" style={{ maxWidth: 300 }} value={activeVault} onChange={e => setSelectedVaultId(e.target.value)}>
                        {vaultData.vaults.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            )}

            {isLoading ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
            ) : documents.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <FileText size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>No documents yet. Upload an encrypted file.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {documents.map(doc => (
                        <div key={doc.id} className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <FileText size={20} style={{ color: 'var(--color-accent-secondary)', flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontWeight: 500, fontSize: 14 }}>{doc.fileName}</p>
                                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{doc.mimeType} · {fmtSize(doc.sizeBytes)}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <a href={`/api/documents/${doc.id}/download`} className="btn btn-ghost" style={{ padding: '6px' }}>
                                    <Download size={15} />
                                </a>
                                <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => deleteMutation.mutate(doc.id)}>
                                    <Trash2 size={15} style={{ color: 'var(--color-danger)' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Upload Document</h2>
                            <button className="btn btn-ghost" onClick={() => setShowUpload(false)}><X size={18} /></button>
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label>Select File</label>
                            <input type="file" ref={fileRef} className="input" style={{ padding: '10px' }} />
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                            🔒 Files are encrypted client-side before upload (AES-256-GCM).
                        </p>
                        <button className="btn btn-primary w-full" onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending}>
                            <Upload size={16} />
                            {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;
