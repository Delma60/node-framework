import { Application } from "../Core/Foundation/Application";
import { AuthMiddleware } from '../app/Http/Middleware/AuthMiddleware';


export function app (path:string) {
    Application
    .configure(path)
    .withRouting({
        api: path + "/routes/api.ts",
    })
    .withMiddleware((middleware) => {
        middleware.alias({
            'auth': AuthMiddleware,
        });
    })
    .create();
}


// boot();