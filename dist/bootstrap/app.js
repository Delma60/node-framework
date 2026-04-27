"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = app;
const Application_1 = require("../Core/Foundation/Application");
function app(path) {
    Application_1.Application
        .configure(path)
        .withRouting({
        api: path + "/routes/api.ts",
    })
        .withMiddleware((middleware) => {
        middleware.web([]);
        middleware.alias({
            ons: {}
        });
    })
        .create();
}
// boot();
//# sourceMappingURL=app.js.map