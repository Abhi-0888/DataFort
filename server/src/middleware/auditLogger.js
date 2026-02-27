const prisma = require('../config/db');

/**
 * Middleware factory that logs sensitive operations to the audit log.
 * @param {string} action  - e.g. "CREDENTIAL_READ"
 * @param {Function} getResource - function(req) returning resource string
 */
const auditLogger = (action, getResource) => async (req, _res, next) => {
    try {
        if (req.user?.id) {
            await prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    action,
                    resource: getResource ? getResource(req) : 'unknown',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
        }
    } catch (_err) {
        // Never block a request due to audit logging failure
        console.error('[AuditLogger] Failed to write audit log:', _err.message);
    }
    next();
};

module.exports = { auditLogger };
