"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
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
}
exports.Request = Request;
//# sourceMappingURL=Request.js.map