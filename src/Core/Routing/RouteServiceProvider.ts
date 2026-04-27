import express, { Application as ExpressApp } from 'express';
import fs from 'fs';
import path from 'path';
import { ServiceProvider } from '../Support/ServiceProvider';
import { Route } from '../Facade/Route';
import { Request as LaravelRequest } from '../Http/Request';
import { ExceptionHandler } from '../Foundation/Exceptions/Handler';

export class RouteServiceProvider extends ServiceProvider {
    private resolveRouteFile(routePath: string): string {
        if (fs.existsSync(routePath)) {
            return routePath;
        }

        if (routePath.endsWith('.ts')) {
            const jsPath = routePath.slice(0, -3) + '.js';
            if (fs.existsSync(jsPath)) {
                return jsPath;
            }
        }

        if (routePath.endsWith('.js')) {
            const tsPath = routePath.slice(0, -3) + '.ts';
            if (fs.existsSync(tsPath)) {
                return tsPath;
            }
        }

        return routePath;
    }

    private resolveRouteHandler(route: any): Function | undefined {
        if (typeof route.action === 'function') {
            return route.action;
        }

        if (Array.isArray(route.action)) {
            const [controller, action] = route.action as [any, string];
            let handler: any;
            let context: any = controller;

            if (typeof controller === 'function') {
                const instance = new controller();
                handler = instance[action] ?? controller[action];
                if (typeof handler === 'function') {
                    context = instance;
                }
            } else if (controller && typeof controller === 'object') {
                handler = controller[action];
            }

            if (typeof handler === 'function') {
            
                return handler.bind(context);
            }
        }

        return undefined;
    }

    /**
     * Wraps the developer's route handler to automatically parse return values
     * exactly like Laravel's Router::toResponse() method.
     */
    private wrapHandler(handler: Function) {
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const customRequest = new LaravelRequest(req);
            try {
                // 1. Execute the developer's handler and capture the return value
                // We still pass req and res in case they want to use them directly
                const response = await handler(customRequest, res);

                // 2. If the developer already sent a response manually (e.g., using res.send()),
                // we safely bail out so we don't cause an Express "headers already sent" crash.
                if (res.headersSent) {
                    return;
                }

                // 3. --- Response Parsing Logic ---
                if (response === undefined || response === null) {
                    // Empty return
                    res.status(200).end();
                } else if (typeof response === 'string' || typeof response === 'number' || typeof response === 'boolean') {
                    // Primitives become text/html or plain text
                    res.status(200).send(String(response));
                } else if (typeof response === 'object') {
                    // Arrays and Objects are automatically serialized to JSON!
                    res.status(200).json(response);
                } else {
                    // Fallback
                    res.status(200).send(response);
                }
            } catch (error) {
                // If the controller throws an exception, catch it and pass it to Express's error handler
                next(error);
            }
        };
    }
    
    public register(): void {
        this.app.bind('router', express());
    }

    public async boot(): Promise<void> {
        const server = this.app.make<ExpressApp>('router');
        const options = this.app.make<any>('routing.options');

        server.use(express.json());

        // 3. Dynamically import and map the Web routes
        if (options && options.web) {
            Route.clear(); 
            await import(this.resolveRouteFile(options.web)); 

            // Ask the Router instance for the collection of Route objects
            const webRoutes = Route.getRoutes();

            for (const route of webRoutes) {
                
                // At this point, you could also map route.routeMiddleware into Express!
                if(server){
                    const method = route.method as keyof ExpressApp;
                    if (typeof server[method] === 'function') {
                        const rawHandler = this.resolveRouteHandler(route);
                        
                        if (rawHandler) {
                            // 🚀 Wrap the handler here before giving it to Express!
                            const expressHandler = this.wrapHandler(rawHandler);
                            (server[method] as any)(route.uri, expressHandler);
                        } else {
                        }
                    }

                }
            }
        }

        // 4. Dynamically import and map the API routes (with an automatic prefix!)
        if (options && options.api) {

            // Clear any existing routes and load API routes using Route facade
            Route.clear();
            await import(this.resolveRouteFile(options.api));

            // Get the API routes from the Route facade
            const apiRoutes = Route.getRoutes();

            // Create API router and apply /api prefix
            const apiRouter = express.Router();

            for (const route of apiRoutes) {

                const method = route.method as keyof typeof apiRouter;
                if (typeof apiRouter[method] === 'function') {
                    const rawHandler = this.resolveRouteHandler(route);
                    
                    if (rawHandler) {
                        // 🚀 Wrap the handler here before giving it to Express!
                        const expressHandler = this.wrapHandler(rawHandler);
                        (apiRouter[method] as any)(route.uri, expressHandler);
                    } else {
                        console.warn(`Skipping API route ${route.method.toUpperCase()} /api${route.uri} because the handler is not a function.`);
                    }
                }
            }

            try {
                const exceptionHandler = this.app.make<ExceptionHandler>('exception.handler');
                
                // Express error middleware MUST have exactly 4 arguments
                server.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
                    // 1. Log the error
                    exceptionHandler.report(err);
                    
                    // 2. Send the formatted response to the user
                    exceptionHandler.render(err, req, res);
                });
            } catch (e) {
                console.warn("⚠️ No exception handler registered in Application.");
            }

            // Mount all API routes under the '/api' prefix automatically
            server.use('/api', apiRouter);
        }

        server.listen(3000, () => {
            console.log('🚀 Server is running on http://localhost:3000');
        });
    }

    /**
     * Wraps the developer's route handler to automatically parse return values
     * exactly like Laravel's Router::toResponse() method.
     */
    // private wrapHandler(handler: Function) {
    //     return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //         try {
    //             // 1. Execute the developer's handler and capture the return value
    //             // We still pass req and res in case they want to use them directly
    //             const response = await handler(req, res);

    //             // 2. If the developer already sent a response manually (e.g., using res.send()), 
    //             // we safely bail out so we don't cause an Express "headers already sent" crash.
    //             if (res.headersSent) {
    //                 return;
    //             }

    //             // 3. --- Response Parsing Logic ---
    //             if (response === undefined || response === null) {
    //                 // Empty return
    //                 res.status(200).end();
    //             } else if (typeof response === 'string' || typeof response === 'number' || typeof response === 'boolean') {
    //                 // Primitives become text/html or plain text
    //                 res.status(200).send(String(response));
    //             } else if (typeof response === 'object') {
    //                 // Arrays and Objects are automatically serialized to JSON!
    //                 res.status(200).json(response);
    //             } else {
    //                 // Fallback
    //                 res.status(200).send(response);
    //             }
    //         } catch (error) {
    //             // If the controller throws an exception, catch it and pass it to Express's error handler
    //             next(error);
    //         }
    //     };
    // }
}