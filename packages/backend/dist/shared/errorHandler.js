export class ErrorHandler {
    static handle(err, req, res, next) {
        const statusCode = err.statusCode || 500;
        const message = err.message || 'Error interno del servidor';
        console.error(`[ERROR] ${statusCode}: ${message}`);
        res.status(statusCode).json({
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }
    static createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        error.isOperational = true;
        return error;
    }
}
export const notFound = (req, res, next) => {
    const error = ErrorHandler.createError(`Ruta no encontrada: ${req.originalUrl}`, 404);
    next(error);
};
//# sourceMappingURL=errorHandler.js.map