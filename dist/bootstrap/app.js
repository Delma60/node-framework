"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = app;
const Application_1 = require("../Core/Foundation/Application");
const AuthMiddleware_1 = require("../app/Http/Middleware/AuthMiddleware");
async function app(path) {
    const application = Application_1.Application
        .configure(path)
        .withRouting({
        api: path + "/routes/api.ts",
    })
        .withMiddleware((middleware) => {
        middleware.alias({
            'auth': AuthMiddleware_1.AuthMiddleware,
        });
    });
    // 🚀 Wait for the app to boot (this initializes all service providers, including DatabaseServiceProvider)
    await application.create();
    return application;
}
// boot();
//# sourceMappingURL=app.js.map