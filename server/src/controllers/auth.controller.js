const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );
    return { accessToken, refreshToken };
};

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        }

        const { email, password } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new AppError('An account with this email already exists.', 409);

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { email, passwordHash },
            select: { id: true, email: true, createdAt: true },
        });

        const { accessToken, refreshToken } = generateTokens(user.id);

        res.status(201).json({ success: true, user, accessToken, refreshToken });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError('Invalid email or password.', 401);

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new AppError('Invalid email or password.', 401);

        const { accessToken, refreshToken } = generateTokens(user.id);

        res.json({
            success: true,
            user: { id: user.id, email: user.email },
            accessToken,
            refreshToken,
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) throw new AppError('Refresh token required.', 400);

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        } catch {
            throw new AppError('Invalid or expired refresh token.', 401);
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) throw new AppError('User not found.', 401);

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
        res.json({ success: true, accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/logout
const logout = async (req, res) => {
    // Stateless JWT: client must discard tokens — server just confirms
    res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, mfaEnabled: true, createdAt: true },
        });
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, logout, getMe, refreshToken };
