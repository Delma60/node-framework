import { Application } from "../Core/Foundation/Application";
import { AuthMiddleware } from '../app/Http/Middleware/AuthMiddleware';


export async function app (path:string) {
    const application = Application
    .configure(path)
    .withRouting({
        api: path + "/routes/api.ts",
    })
    .withMiddleware((middleware) => {
        middleware.alias({
            'auth': AuthMiddleware,
        });
    });

    // 🚀 Wait for the app to boot (this initializes all service providers, including DatabaseServiceProvider)
    await application.create();
    
    return application;
}


// boot();