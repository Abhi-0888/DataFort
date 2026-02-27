/**
 * Global error handler — must be last middleware registered.
 */
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    if (process.env.NODE_ENV === 'development') {
        console.error(`[Error] ${statusCode} — ${message}\n`, err.stack);
    } else {
        console.error(`[Error] ${statusCode} — ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'An unexpected error occurred.' : message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * Helper to create HTTP errors with a status code.
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { errorHandler, AppError };
