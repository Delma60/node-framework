import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
export declare class ExceptionHandler {
    /**
     * Report or log an exception.
     */
    report(error: Error): void;
    /**
     * Render an exception into an HTTP response.
     */
    render(error: Error, req: ExpressRequest, res: ExpressResponse): void;
}
//# sourceMappingURL=Handler.d.ts.map