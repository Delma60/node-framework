"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const HttpException_1 = require("../../../Core/Foundation/Exceptions/HttpException");
class AuthMiddleware {
    async handle(request, next) {
        const token = request.bearerToken();
        if (token !== 'secret-token') {
            throw new HttpException_1.HttpException(401, 'Unauthenticated. Invalid token.');
        }
        next();
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map