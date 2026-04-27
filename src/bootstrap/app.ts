import { Application } from "../Core/Foundation/Application";


export function app (path:string) {
    Application
    .configure(path)
    .withRouting({
        api: path + "/routes/api.ts",
    })
    .withMiddleware((middleware) => {
        middleware.web([

        ])

        middleware.alias({
            ons: {}
        })
    })
    .create();
}


// boot();