import { UserController } from "../app/Http/Controllers/UserController";
import { Route } from "../Core/Facade/Route";

// API routes with fluent grouping syntax and Laravel-style return values

Route.resource("users", UserController).middleware("auth");
// Route.post("/", [UserC])
Route.prefix('/v1')
    .middleware('auth')
    .name('api')
    .group(() => {
        // 1. Returning an Object automatically sends JSON with a 200 status
        Route.get('/users', async () => {
            return [
                { id: 1, name: 'Taylor' },
                { id: 2, name: 'Ryan' }
            ];
        });

        // 2. Returning a String automatically sends text/html
        Route.get('/hello', () => {
            return "<h1>Hello World!</h1>";
        });

        // 3. Throwing an error will safely get caught by the wrapper's try/catch block
        Route.get('/error', () => {
            throw new Error("Something went wrong!");
        });

        Route.post('/users', (req: any) => {
            return { message: 'User created', user: req.body };
        });

        Route.get('/posts', () => {
            return { posts: [{ id: 1, title: 'Hello World' }] };
        });

        // Protected route example
        Route.get('/protected-dashboard', () => {
            return { message: "You are logged in!" };
        }).middleware('auth');
    });