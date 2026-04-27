"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionHandler = void 0;
const ValidationException_1 = require("./ValidationException");
class ExceptionHandler {
    /**
     * Report or log an exception.
     */
    report(error) {
        const normalized = this.normalizeError(error);
        if (normalized.statusCode < 500) {
            return;
        }
        console.error(`\n❌ [Exception Caught] ${normalized.name}: ${normalized.message}`);
        if (normalized.stack) {
            console.error(normalized.stack);
        }
    }
    /**
     * Render an exception into an HTTP response.
     */
    render(error, req, res) {
        if (res.headersSent) {
            return;
        }
        const normalized = this.normalizeError(error);
        const statusCode = normalized.statusCode;
        const payload = {
            message: normalized.message || 'Internal Server Error',
        };
        if (error instanceof ValidationException_1.ValidationException) {
            payload.errors = error.errors;
        }
        if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
            payload.error = normalized.name;
            payload.stack = normalized.stack?.split('\n').map(line => line.trim());
        }
        res.status(statusCode).json(payload);
    }
    normalizeError(error) {
        if (error instanceof Error) {
            const statusCode = error.statusCode || error.status || 500;
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
                statusCode: this.normalizeStatusCode(statusCode),
            };
        }
        if (typeof error === 'string') {
            return {
                name: 'Error',
                message: error,
                statusCode: 500,
            };
        }
        if (typeof error === 'object' && error !== null) {
            const body = error;
            return {
                name: body.name || 'Error',
                message: body.message || JSON.stringify(body) || 'Unknown error',
                stack: body.stack || undefined,
                statusCode: this.normalizeStatusCode(body.status || body.statusCode || 500),
            };
        }
        return {
            name: 'Error',
            message: 'Unknown error',
            statusCode: 500,
        };
    }
    normalizeStatusCode(value) {
        const statusCode = Number(value);
        if (Number.isFinite(statusCode) && statusCode >= 100 && statusCode < 600) {
            return statusCode;
        }
        return 500;
    }
}
exports.ExceptionHandler = ExceptionHandler;
//# sourceMappingURL=Handler.js.map