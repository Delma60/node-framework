import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export class ExceptionHandler {
    /**
     * Report or log an exception.
     */
    public report(error: Error): void {
        console.error(`\n❌ [Exception Caught] ${error.name}: ${error.message}`);
        console.error(error.stack);
    }

    /**
     * Render an exception into an HTTP response.
     */
    public render(error: Error, req: ExpressRequest, res: ExpressResponse): void {
        // Check if the error has a specific status code, otherwise default to 500
        const statusCode = (error as any).status || (error as any).statusCode || 500;
        
        // Prepare the payload
        const payload: any = {
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