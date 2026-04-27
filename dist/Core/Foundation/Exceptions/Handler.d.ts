import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
export declare class ExceptionHandler {
    /**
     * Report or log an exception.
     */
    report(error: unknown): void;
    /**
     * Render an exception into an HTTP response.
     */
    render(error: unknown, req: ExpressRequest, res: ExpressResponse): void;
    private normalizeError;
    private normalizeStatusCode;
}
//# sourceMappingURL=Handler.d.ts.map