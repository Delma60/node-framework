import { Request } from './Request';

export interface IMiddleware {
    /**
     * Handle an incoming request.
     */
    handle(request: Request, next: Function): Promise<void> | void;
}