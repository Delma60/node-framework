import { Request as ExpressRequest } from 'express';

export class Request {
    // We hold the original Express request privately
    private req: ExpressRequest;

    constructor(req: ExpressRequest) {
        this.req = req;
    }

    /**
     * Get all of the input and files for the request.
     */
    public all(): Record<string, any> {
        // Combines query parameters, route parameters, and body payloads
        return { ...this.req.query, ...this.req.params, ...this.req.body };
    }

    /**
     * Retrieve an input item from the request.
     */
    public input(key: string, defaultValue: any = null): any {
        const payload = this.all();
        return payload[key] !== undefined ? payload[key] : defaultValue;
    }

    /**
     * Determine if the request contains a given input item key.
     */
    public has(key: string): boolean {
        return this.all()[key] !== undefined;
    }

    /**
     * Retrieve a query string item from the request.
     */
    public query(key?: string, defaultValue: any = null): any {
        if (!key) {
            return this.req.query;
        }
        return this.req.query[key] !== undefined ? this.req.query[key] : defaultValue;
    }

    /**
     * Get the bearer token from the request headers.
     */
    public bearerToken(): string | null {
        const header = this.req.headers['authorization'];
        if (header && header.startsWith('Bearer ')) {
            return header.substring(7);
        }
        return null;
    }

    /**
     * Get the client IP address.
     */
    public ip(): string {
        return this.req.ip || this.req.socket.remoteAddress || '127.0.0.1';
    }

    /**
     * Escape hatch: Access the raw Express Request if the developer really needs it.
     */
    public express(): ExpressRequest {
        return this.req;
    }
}