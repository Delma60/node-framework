"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionHandler = void 0;
class ExceptionHandler {
    /**
     * Report or log an exception.
     */
    report(error) {
        console.error(`\n❌ [Exception Caught] ${error.name}: ${error.message}`);
        console.error(error.stack);
    }
    /**
     * Render an exception into an HTTP response.
     */
    render(error, req, res) {
        // Check if the error has a specific status code, otherwise default to 500
        const statusCode = error.status || error.statusCode || 500;
        // Prepare the payload
        const payload = {
            message: error.message || 'Internal Server Error',
        };
        // In Laravel, stack traces are only shown if APP_DEBUG is true.
        // We will mimic this by checking the NODE_ENV.
        if (process.env.NODE_ENV !== 'production') {
            payload.error = error.name;
            payload.stack = error.stack?.split('\n').map(line => line.trim());
        }
        // Send the JSON response
        res.status(statusCode).json(payload);
    }
}
exports.ExceptionHandler = ExceptionHandler;
//# sourceMappingURL=Handler.js.map