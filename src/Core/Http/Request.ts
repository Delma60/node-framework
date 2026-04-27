import { Request as ExpressRequest } from 'express';
import { Validator } from '../Validation/Validator';
import { ValidationException } from '../Foundation/Exceptions/ValidationException';

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

    public validate(rules: Record<string, string | string[]>): Record<string, any> {
        const payload = this.all();


        // 1. Run the validator
        const errors = Validator.make(payload, rules);

        // 2. If there are errors, throw the exception!
        // (Your global ExceptionHandler will catch this and send a 422 automatically)
        if (Object.keys(errors).length > 0) {
            throw new ValidationException(errors);
        }

        // 3. If it passes, return ONLY the data that was defined in the rules
        // (This prevents users from injecting unwanted data into your database)
        const validatedData: Record<string, any> = {};
        for (const key in rules) {
            if (payload[key] !== undefined) {
                validatedData[key] = payload[key];
            }
        }

        return validatedData;
    }
}