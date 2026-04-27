import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ValidationException } from './ValidationException';

export class ExceptionHandler {
    /**
     * Report or log an exception.
     */
    public report(error: unknown): void {
        const normalized = this.normalizeError(error);

        if (normalized.statusCode < 500) {
            return;
        }

        console.error(`\n❌ [Exception Caught] ${normalized.name}: ${normalized.message}`);
        if (normalized.stack) {
            console.error(normalized.stack);
        }
    }

    /**
     * Render an exception into an HTTP response.
     */
    public render(error: unknown, req: ExpressRequest, res: ExpressResponse): void {
        if (res.headersSent) {
            return;
        }

        const normalized = this.normalizeError(error);
        const statusCode = normalized.statusCode;

        const payload: any = {
            message: normalized.message || 'Internal Server Error',
        };

        if (error instanceof ValidationException) {
            payload.errors = error.errors;
        }

        if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
            payload.error = normalized.name;
            payload.stack = normalized.stack?.split('\n').map(line => line.trim());
        }

        res.status(statusCode).json(payload);
    }

    private normalizeError(error: unknown): { name: string; message: string; statusCode: number; stack?: string | undefined } {
        if (error instanceof Error) {
            const statusCode = (error as any).statusCode || (error as any).status || 500;

            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
                statusCode: this.normalizeStatusCode(statusCode),
            };
        }

        if (typeof error === 'string') {
            return {
                name: 'Error',
                message: error,
                statusCode: 500,
            };
        }

        if (typeof error === 'object' && error !== null) {
            const body = error as Record<string, unknown>;

            return {
                name: (body.name as string) || 'Error',
                message: (body.message as string) || JSON.stringify(body) || 'Unknown error',
                stack: (body.stack as string) || undefined,
                statusCode: this.normalizeStatusCode((body.status as number) || (body.statusCode as number) || 500),
            };
        }

        return {
            name: 'Error',
            message: 'Unknown error',
            statusCode: 500,
        };
    }

    private normalizeStatusCode(value: unknown): number {
        const statusCode = Number(value);
        if (Number.isFinite(statusCode) && statusCode >= 100 && statusCode < 600) {
            return statusCode;
        }

        return 500;
    }
}