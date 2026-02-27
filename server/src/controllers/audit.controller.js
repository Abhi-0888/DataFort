const prisma = require('../config/db');

// GET /api/audit?page=1&limit=20
const getAuditLogs = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: { userId: req.user.id },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    action: true,
                    resource: true,
                    ipAddress: true,
                    userAgent: true,
                    timestamp: true,
                },
            }),
            prisma.auditLog.count({ where: { userId: req.user.id } }),
        ]);

        res.json({
            success: true,
            logs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) { next(err); }
};

module.exports = { getAuditLogs };
