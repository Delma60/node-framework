"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserController_1 = require("../app/Http/Controllers/UserController");
const Route_1 = require("../Core/Facade/Route");
// API routes with fluent grouping syntax and Laravel-style return values
// Route.post("/", [UserC])
Route_1.Route.prefix('/v1')
    .middleware('auth')
    .name('api')
    .group(() => {
    Route_1.Route.resource("users", UserController_1.UserController).middleware("auth");
});
//# sourceMappingURL=api.js.map