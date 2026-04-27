import { IMiddleware } from '../../../Core/Http/Middleware';
import { Request } from '../../../Core/Http/Request';
import { HttpException } from '../../../Core/Foundation/Exceptions/HttpException';

export class AuthMiddleware implements IMiddleware {
    public async handle(request: Request, next: Function) {
        const token = request.bearerToken();

        if (token !== '1234567') {
            throw new HttpException(401, 'Unauthenticated. Invalid token.');
        }
        next();
    }
}