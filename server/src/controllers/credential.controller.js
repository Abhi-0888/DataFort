const { z } = require('zod');
const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// All credential fields are pre-encrypted by the client (AES-256-GCM)
// The server stores encrypted blobs — never plaintext
const credentialSchema = z.object({
    vaultId: z.string().uuid(),
    label: z.string().min(1).max(200),
    url: z.string().url().optional().nullable(),
    encryptedUsername: z.string(),
    encryptedPassword: z.string(),
    encryptedNotes: z.string().optional().nullable(),
    iv: z.string(),
    authTag: z.string(),
});

// Helper — verify vault belongs to user
const assertVaultOwnership = async (vaultId, userId) => {
    const vault = await prisma.vault.findFirst({ where: { id: vaultId, userId } });
    if (!vault) throw new AppError('Vault not found.', 404);
    return vault;
};

// GET /api/credentials/vault/:vaultId
const getCredentials = async (req, res, next) => {
    try {
        await assertVaultOwnership(req.params.vaultId, req.user.id);
        const credentials = await prisma.credential.findMany({
            where: { vaultId: req.params.vaultId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, credentials });
    } catch (err) { next(err); }
};

// POST /api/credentials
const createCredential = async (req, res, next) => {
    try {
        const parsed = credentialSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors[0].message });

        await assertVaultOwnership(parsed.data.vaultId, req.user.id);

        const credential = await prisma.credential.create({ data: parsed.data });
        res.status(201).json({ success: true, credential });
    } catch (err) { next(err); }
};

// PUT /api/credentials/:id
const updateCredential = async (req, res, next) => {
    try {
        const existing = await prisma.credential.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new AppError('Credential not found.', 404);
        await assertVaultOwnership(existing.vaultId, req.user.id);

        const parsed = credentialSchema.partial().safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors[0].message });

        const credential = await prisma.credential.update({ where: { id: req.params.id }, data: parsed.data });
        res.json({ success: true, credential });
    } catch (err) { next(err); }
};

// DELETE /api/credentials/:id
const deleteCredential = async (req, res, next) => {
    try {
        const existing = await prisma.credential.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new AppError('Credential not found.', 404);
        await assertVaultOwnership(existing.vaultId, req.user.id);

        await prisma.credential.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Credential deleted.' });
    } catch (err) { next(err); }
};

module.exports = { getCredentials, createCredential, updateCredential, deleteCredential };
