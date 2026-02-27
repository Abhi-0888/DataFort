const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
];

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
    console.error(`\n❌ Missing required environment variables:\n  ${missingVars.join('\n  ')}\n`);
    process.exit(1);
}

module.exports = {
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        url: process.env.DATABASE_URL,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    },

    encryption: {
        key: process.env.ENCRYPTION_KEY,
    },

    cors: {
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },

    upload: {
        maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50,
        dir: process.env.UPLOAD_DIR || './uploads',
    },
};
