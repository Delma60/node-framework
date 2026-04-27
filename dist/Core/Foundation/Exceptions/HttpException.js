"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
class HttpException extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        // Ensure the name of the error matches the class name (e.g., "NotFoundException")
        this.name = this.constructor.name;
        // Capture the correct stack trace (Node.js specific)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpException = HttpException;
//# sourceMappingURL=HttpException.js.map