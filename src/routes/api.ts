import { UserController } from "../app/Http/Controllers/UserController";
import { Route } from "../Core/Facade/Route";

// API routes with fluent grouping syntax and Laravel-style return values

// Route.post("/", [UserC])
Route.prefix('/v1')
.middleware('auth')
.name('api')
.group(() => {

    Route.resource("users", UserController).middleware("auth");
    
});