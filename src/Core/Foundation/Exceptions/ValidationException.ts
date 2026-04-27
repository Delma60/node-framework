import { HttpException } from './HttpException';

export class ValidationException extends HttpException {
    public errors: Record<string, string[]>;

    constructor(errors: Record<string, string[]> = {}, message: string = 'The given data was invalid.') {
        super(422, message);
        this.errors = errors;
    }
}