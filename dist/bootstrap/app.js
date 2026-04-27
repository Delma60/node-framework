"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = app;
const Application_1 = require("../Core/Foundation/Application");
const AuthMiddleware_1 = require("../app/Http/Middleware/AuthMiddleware");
function app(path) {
    Application_1.Application
        .configure(path)
        .withRouting({
        api: path + "/routes/api.ts",
    })
        .withMiddleware((middleware) => {
        middleware.alias({
            'auth': AuthMiddleware_1.AuthMiddleware,
        });
    })
        .create();
}
// boot();
//# sourceMappingURL=app.js.map