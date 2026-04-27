"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const Validator_1 = require("../Validation/Validator");
const ValidationException_1 = require("../Foundation/Exceptions/ValidationException");
class Request {
    // We hold the original Express request privately
    req;
    constructor(req) {
        this.req = req;
    }
    /**
     * Get all of the input and files for the request.
     */
    all() {
        // Combines query parameters, route parameters, and body payloads
        return { ...this.req.query, ...this.req.params, ...this.req.body };
    }
    /**
     * Retrieve an input item from the request.
     */
    input(key, defaultValue = null) {
        const payload = this.all();
        return payload[key] !== undefined ? payload[key] : defaultValue;
    }
    /**
     * Determine if the request contains a given input item key.
     */
    has(key) {
        return this.all()[key] !== undefined;
    }
    /**
     * Retrieve a query string item from the request.
     */
    query(key, defaultValue = null) {
        if (!key) {
            return this.req.query;
        }
        return this.req.query[key] !== undefined ? this.req.query[key] : defaultValue;
    }
    /**
     * Get the bearer token from the request headers.
     */
    bearerToken() {
        const header = this.req.headers['authorization'];
        if (header && header.startsWith('Bearer ')) {
            return header.substring(7);
        }
        return null;
    }
    /**
     * Get the client IP address.
     */
    ip() {
        return this.req.ip || this.req.socket.remoteAddress || '127.0.0.1';
    }
    /**
     * Escape hatch: Access the raw Express Request if the developer really needs it.
     */
    express() {
        return this.req;
    }
    validate(rules) {
        const payload = this.all();
        // 1. Run the validator
        const errors = Validator_1.Validator.make(payload, rules);
        // 2. If there are errors, throw the exception!
        // (Your global ExceptionHandler will catch this and send a 422 automatically)
        if (Object.keys(errors).length > 0) {
            throw new ValidationException_1.ValidationException(errors);
        }
        // 3. If it passes, return ONLY the data that was defined in the rules
        // (This prevents users from injecting unwanted data into your database)
        const validatedData = {};
        for (const key in rules) {
            if (payload[key] !== undefined) {
                validatedData[key] = payload[key];
            }
        }
        return validatedData;
    }
}
exports.Request = Request;
//# sourceMappingURL=Request.js.map