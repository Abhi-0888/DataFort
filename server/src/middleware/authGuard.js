const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Zero-Trust auth guard — every request must carry a valid JWT.
 * No session, no cookie trust, no implicit state.
 */
const authGuard = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authorization token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            const message = err.name === 'TokenExpiredError'
                ? 'Token has expired. Please log in again.'
                : 'Invalid token.';
            return res.status(401).json({ success: false, message });
        }

        // Re-verify user still exists in DB (zero-trust: don't assume they do)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { authGuard };
