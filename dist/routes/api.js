"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserController_1 = require("../app/Http/Controllers/UserController");
const Route_1 = require("../Core/Facade/Route");
// API routes with fluent grouping syntax and Laravel-style return values
Route_1.Route.get("/", [UserController_1.UserController, 'index']);
Route_1.Route.prefix('/v1')
    .middleware('api')
    .name('api')
    .group(() => {
    // 1. Returning an Object automatically sends JSON with a 200 status
    Route_1.Route.get('/users', async () => {
        return [
            { id: 1, name: 'Taylor' },
            { id: 2, name: 'Ryan' }
        ];
    });
    // 2. Returning a String automatically sends text/html
    Route_1.Route.get('/hello', () => {
        return "<h1>Hello World!</h1>";
    });
    // 3. Throwing an error will safely get caught by the wrapper's try/catch block
    Route_1.Route.get('/error', () => {
        throw new Error("Something went wrong!");
    });
    Route_1.Route.post('/users', (req) => {
        return { message: 'User created', user: req.body };
    });
    Route_1.Route.get('/posts', () => {
        return { posts: [{ id: 1, title: 'Hello World' }] };
    });
});
//# sourceMappingURL=api.js.map