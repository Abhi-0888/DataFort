const { z } = require('zod');
const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const vaultSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
});

// GET /api/vaults
const getVaults = async (req, res, next) => {
    try {
        const vaults = await prisma.vault.findMany({
            where: { userId: req.user.id },
            include: {
                _count: { select: { credentials: true, documents: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, vaults });
    } catch (err) { next(err); }
};

// GET /api/vaults/:id
const getVaultById = async (req, res, next) => {
    try {
        const vault = await prisma.vault.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: { _count: { select: { credentials: true, documents: true } } },
        });
        if (!vault) throw new AppError('Vault not found.', 404);
        res.json({ success: true, vault });
    } catch (err) { next(err); }
};

// POST /api/vaults
const createVault = async (req, res, next) => {
    try {
        const parsed = vaultSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors[0].message });

        const vault = await prisma.vault.create({
            data: { ...parsed.data, userId: req.user.id },
        });
        res.status(201).json({ success: true, vault });
    } catch (err) { next(err); }
};

// PUT /api/vaults/:id
const updateVault = async (req, res, next) => {
    try {
        const existing = await prisma.vault.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) throw new AppError('Vault not found.', 404);

        const parsed = vaultSchema.partial().safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors[0].message });

        const vault = await prisma.vault.update({ where: { id: req.params.id }, data: parsed.data });
        res.json({ success: true, vault });
    } catch (err) { next(err); }
};

// DELETE /api/vaults/:id
const deleteVault = async (req, res, next) => {
    try {
        const existing = await prisma.vault.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) throw new AppError('Vault not found.', 404);

        await prisma.vault.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Vault deleted.' });
    } catch (err) { next(err); }
};

module.exports = { getVaults, getVaultById, createVault, updateVault, deleteVault };
