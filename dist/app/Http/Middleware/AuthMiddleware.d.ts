import { IMiddleware } from '../../../Core/Http/Middleware';
import { Request } from '../../../Core/Http/Request';
export declare class AuthMiddleware implements IMiddleware {
    handle(request: Request, next: Function): Promise<void>;
}
//# sourceMappingURL=AuthMiddleware.d.ts.map