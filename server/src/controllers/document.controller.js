const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// Helper — verify vault belongs to user
const assertVaultOwnership = async (vaultId, userId) => {
    const vault = await prisma.vault.findFirst({ where: { id: vaultId, userId } });
    if (!vault) throw new AppError('Vault not found.', 404);
    return vault;
};

// GET /api/documents/vault/:vaultId
const listDocuments = async (req, res, next) => {
    try {
        await assertVaultOwnership(req.params.vaultId, req.user.id);
        const documents = await prisma.document.findMany({
            where: { vaultId: req.params.vaultId },
            select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, documents });
    } catch (err) { next(err); }
};

// POST /api/documents/upload
const uploadDocument = async (req, res, next) => {
    try {
        const { vaultId, iv, authTag } = req.body;
        if (!vaultId || !iv || !authTag || !req.file) {
            throw new AppError('Missing required fields: vaultId, iv, authTag, file.', 400);
        }

        await assertVaultOwnership(vaultId, req.user.id);

        const doc = await prisma.document.create({
            data: {
                vaultId,
                fileName: req.file.originalname,
                storagePath: req.file.path,
                mimeType: req.file.mimetype,
                sizeBytes: req.file.size,
                iv,
                authTag,
            },
        });

        res.status(201).json({ success: true, document: doc });
    } catch (err) { next(err); }
};

// GET /api/documents/:id/download
const downloadDocument = async (req, res, next) => {
    try {
        const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
        if (!doc) throw new AppError('Document not found.', 404);

        await assertVaultOwnership(doc.vaultId, req.user.id);

        if (!fs.existsSync(doc.storagePath)) throw new AppError('File not found on server.', 404);

        // Return the encrypted blob + metadata; client decrypts
        res.setHeader('X-IV', doc.iv);
        res.setHeader('X-AuthTag', doc.authTag);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
        fs.createReadStream(doc.storagePath).pipe(res);
    } catch (err) { next(err); }
};

// DELETE /api/documents/:id
const deleteDocument = async (req, res, next) => {
    try {
        const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
        if (!doc) throw new AppError('Document not found.', 404);

        await assertVaultOwnership(doc.vaultId, req.user.id);

        // Delete from disk
        if (fs.existsSync(doc.storagePath)) {
            fs.unlinkSync(doc.storagePath);
        }

        await prisma.document.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Document deleted.' });
    } catch (err) { next(err); }
};

module.exports = { listDocuments, uploadDocument, downloadDocument, deleteDocument };
