import { HttpException } from './HttpException';
export declare class ValidationException extends HttpException {
    errors: Record<string, string[]>;
    constructor(errors?: Record<string, string[]>, message?: string);
}
//# sourceMappingURL=ValidationException.d.ts.map