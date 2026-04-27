import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
    constructor(message: string = 'The requested resource could not be found.') {
        super(404, message);
    }
}