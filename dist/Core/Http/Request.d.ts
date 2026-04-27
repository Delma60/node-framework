import { Request as ExpressRequest } from 'express';
export declare class Request {
    private req;
    constructor(req: ExpressRequest);
    /**
     * Get all of the input and files for the request.
     */
    all(): Record<string, any>;
    /**
     * Retrieve an input item from the request.
     */
    input(key: string, defaultValue?: any): any;
    /**
     * Determine if the request contains a given input item key.
     */
    has(key: string): boolean;
    /**
     * Retrieve a query string item from the request.
     */
    query(key?: string, defaultValue?: any): any;
    /**
     * Get the bearer token from the request headers.
     */
    bearerToken(): string | null;
    /**
     * Get the client IP address.
     */
    ip(): string;
    /**
     * Escape hatch: Access the raw Express Request if the developer really needs it.
     */
    express(): ExpressRequest;
    validate(rules: Record<string, string | string[]>): Record<string, any>;
}
//# sourceMappingURL=Request.d.ts.map