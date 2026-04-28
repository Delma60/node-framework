"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteServiceProvider = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const ServiceProvider_1 = require("../Support/ServiceProvider");
const Route_1 = require("../Facade/Route");
const Router_1 = require("./Router");
const Request_1 = require("../Http/Request");
class RouteServiceProvider extends ServiceProvider_1.ServiceProvider {
    resolveRouteFile(routePath) {
        if (fs_1.default.existsSync(routePath)) {
            return routePath;
        }
        if (routePath.endsWith('.ts')) {
            const jsPath = routePath.slice(0, -3) + '.js';
            if (fs_1.default.existsSync(jsPath)) {
                return jsPath;
            }
        }
        if (routePath.endsWith('.js')) {
            const tsPath = routePath.slice(0, -3) + '.ts';
            if (fs_1.default.existsSync(tsPath)) {
                return tsPath;
            }
        }
        return routePath;
    }
    resolveRouteHandler(route) {
        if (typeof route.action === 'function') {
            return route.action;
        }
        if (Array.isArray(route.action)) {
            const [controller, action] = route.action;
            let handler;
            let context = controller;
            if (typeof controller === 'function') {
                const instance = new controller();
                handler = instance[action] ?? controller[action];
                if (typeof handler === 'function') {
                    context = instance;
                }
            }
            else if (controller && typeof controller === 'object') {
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
    wrapHandler(handler) {
        return async (req, res, next) => {
            const customRequest = new Request_1.Request(req);
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
                }
                else if (typeof response === 'string' || typeof response === 'number' || typeof response === 'boolean') {
                    // Primitives become text/html or plain text
                    res.status(200).send(String(response));
                }
                else if (typeof response === 'object') {
                    // Arrays and Objects are automatically serialized to JSON!
                    res.status(200).json(response);
                }
                else {
                    // Fallback
                    res.status(200).send(response);
                }
            }
            catch (error) {
                // If the controller throws an exception, catch it and pass it to Express's error handler
                next(error);
            }
        };
    }
    register() {
        // 🚀 Bind the Router instance so facades can resolve it
        this.app.bind('router', new Router_1.Router());
        // Also bind the Express server for internal use during boot
        this.app.bind('express.app', (0, express_1.default)());
    }
    async boot() {
        const server = this.app.make('express.app');
        const options = this.app.make('routing.options');
        const middlewareConfig = this.app.make('middleware');
        // 1. Apply Trusted Proxies
        if (middlewareConfig.trustedProxies) {
            server.set('trust proxy', middlewareConfig.trustedProxies);
        }
        server.use(express_1.default.json());
        const instantiateMiddleware = (MiddlewareClass) => {
            return async (req, res, next) => {
                try {
                    const customRequest = new Request_1.Request(req);
                    const instance = new MiddlewareClass();
                    await instance.handle(customRequest, next);
                }
                catch (error) {
                    next(error);
                }
            };
        };
        if (middlewareConfig && middlewareConfig.globalMiddlewares.length > 0) {
            const globalMiddlewares = middlewareConfig.globalMiddlewares.map(instantiateMiddleware);
            // server.use() attaches them globally to Express
            server.use(...globalMiddlewares);
        }
        // 3. Dynamically import and map the Web routes
        // if (options && options.web) {
        //     Route.clear(); 
        //     await import(this.resolveRouteFile(options.web)); 
        //     // Ask the Router instance for the collection of Route objects
        //     const webRoutes = Route.getRoutes();
        //     const webGroupMiddlewares = middlewareConfig.webGroup.map(instantiateMiddleware);
        //     for (const route of webRoutes) {
        //         if (server) {
        //             const method = route.method as keyof ExpressApp;
        //             if (typeof server[method] === 'function') {
        //                 const rawHandler = this.resolveRouteHandler(route);
        //                 if (rawHandler) {
        //                     // 1. Create the Express Handler
        //                     const expressHandler = this.wrapHandler(rawHandler);
        //                     // 2. 🚀 Resolve and wrap the middlewares!
        //                     const expressMiddlewares = [];
        //                     if (route.routeMiddleware && route.routeMiddleware.length > 0) {
        //                         // Grab the alias registry from the container
        //                         const config = this.app.make<MiddlewareConfig>('middleware');
        //                         for (const alias of route.routeMiddleware) {
        //                             const MiddlewareClass = config.aliases[alias];
        //                             if (!MiddlewareClass) {
        //                                 throw new Error(`Middleware alias [${alias}] has not been registered.`);
        //                             }
        //                             // Create an Express middleware wrapper
        //                             expressMiddlewares.push(async (req: any, res: any, next: any) => {
        //                                 try {
        //                                     const customRequest = new LaravelRequest(req);
        //                                     const instance = new MiddlewareClass();
        //                                     // Call the user's handle method!
        //                                     await instance.handle(customRequest, next);
        //                                 } catch (error) {
        //                                     // If the middleware throws an HttpException, pass it to the global error handler!
        //                                     next(error);
        //                                 }
        //                             });
        //                         }
        //                     }
        //                     // 3. Inject the middlewares into Express BEFORE the handler
        //                     (server[method] as any)(route.uri, ...expressMiddlewares, expressHandler);
        //                 }
        //             }
        //         }
        //     }
        // }
        if (options && options.web) {
            Route_1.Route.clear();
            await Promise.resolve(`${this.resolveRouteFile(options.web)}`).then(s => __importStar(require(s)));
            const webRoutes = Route_1.Route.getRoutes();
            // 🚀 Pre-compile the Web Group Middlewares
            const webGroupMiddlewares = middlewareConfig.webGroup.map(instantiateMiddleware);
            for (const route of webRoutes) {
                const method = route.method;
                if (typeof server[method] === 'function') {
                    const rawHandler = this.resolveRouteHandler(route);
                    if (rawHandler) {
                        const expressHandler = this.wrapHandler(rawHandler);
                        // Resolve route-specific aliases (e.g., ->middleware('auth'))
                        const routeMiddlewares = (route.routeMiddleware || []).map((alias) => {
                            const MiddlewareClass = middlewareConfig.aliases[alias];
                            if (!MiddlewareClass)
                                throw new Error(`Middleware alias [${alias}] not found.`);
                            return instantiateMiddleware(MiddlewareClass);
                        });
                        // Inject: Group Middlewares -> Route Middlewares -> Handler
                        server[method](route.uri, ...webGroupMiddlewares, ...routeMiddlewares, expressHandler);
                    }
                }
            }
        }
        // 4. Dynamically import and map the API routes (with an automatic prefix!)
        // if (options && options.api) {
        //     // Clear any existing routes and load API routes using Route facade
        //     Route.clear();
        //     await import(this.resolveRouteFile(options.api));
        //     // Get the API routes from the Route facade
        //     const apiRoutes = Route.getRoutes();
        //     // Create API router and apply /api prefix
        //     const apiRouter = express.Router();
        //     for (const route of apiRoutes) {
        //         const method = route.method as keyof typeof apiRouter;
        //         if (typeof apiRouter[method] === 'function') {
        //             const rawHandler = this.resolveRouteHandler(route);
        //             if (rawHandler) {
        //                 const expressHandler = this.wrapHandler(rawHandler);
        //                 // 🚀 Resolve and wrap the middlewares for API routes!
        //                 const expressMiddlewares = [];
        //                 if (route.routeMiddleware && route.routeMiddleware.length > 0) {
        //                     // Grab the alias registry from the container
        //                     const config = this.app.make<MiddlewareConfig>('middleware');
        //                     for (const alias of route.routeMiddleware) {
        //                         const MiddlewareClass = config.aliases[alias];
        //                         if (!MiddlewareClass) {
        //                             throw new Error(`Middleware alias [${alias}] has not been registered.`);
        //                         }
        //                         // Create an Express middleware wrapper
        //                         expressMiddlewares.push(async (req: any, res: any, next: any) => {
        //                             try {
        //                                 const customRequest = new LaravelRequest(req);
        //                                 const instance = new MiddlewareClass();
        //                                 // Call the user's handle method!
        //                                 await instance.handle(customRequest, next);
        //                             } catch (error) {
        //                                 // If the middleware throws an HttpException, pass it to the global error handler!
        //                                 next(error);
        //                             }
        //                         });
        //                     }
        //                 }
        //                 // Inject the middlewares into Express BEFORE the handler
        //                 (apiRouter[method] as any)(route.uri, ...expressMiddlewares, expressHandler);
        //             } else {
        //                 // console.warn(`Skipping API route ${route.method.toUpperCase()} /api${route.uri} because the handler is not a function.`);
        //             }
        //         }
        //     }
        //     // Mount all API routes under the '/api' prefix automatically
        //     server.use('/api', apiRouter);
        // }
        if (options && options.api) {
            Route_1.Route.clear();
            await Promise.resolve(`${this.resolveRouteFile(options.api)}`).then(s => __importStar(require(s)));
            const apiRoutes = Route_1.Route.getRoutes();
            const apiRouter = express_1.default.Router();
            // 🚀 Pre-compile the API Group Middlewares
            const apiGroupMiddlewares = middlewareConfig.apiGroup.map(instantiateMiddleware);
            for (const route of apiRoutes) {
                const method = route.method;
                if (typeof apiRouter[method] === 'function') {
                    const rawHandler = this.resolveRouteHandler(route);
                    if (rawHandler) {
                        const expressHandler = this.wrapHandler(rawHandler);
                        const routeMiddlewares = (route.routeMiddleware || []).map((alias) => {
                            const MiddlewareClass = middlewareConfig.aliases[alias];
                            if (!MiddlewareClass)
                                throw new Error(`Middleware alias [${alias}] not found.`);
                            return instantiateMiddleware(MiddlewareClass);
                        });
                        apiRouter[method](route.uri, ...apiGroupMiddlewares, ...routeMiddlewares, expressHandler);
                    }
                }
            }
            server.use('/api', apiRouter);
        }
        let exceptionHandler;
        try {
            exceptionHandler = this.app.make('exception.handler');
        }
        catch (e) {
            console.warn("⚠️ No exception handler registered in Application.");
        }
        // Express error middleware MUST have exactly 4 arguments
        server.use((err, req, res, next) => {
            if (res.headersSent) {
                return next(err);
            }
            if (exceptionHandler) {
                exceptionHandler.report(err);
                exceptionHandler.render(err, req, res);
                return;
            }
            console.error('⚠️ Unhandled exception occurred:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
        server.listen(3000, () => {
            console.log('🚀 Server is running on http://localhost:3000');
        });
    }
}
exports.RouteServiceProvider = RouteServiceProvider;
//# sourceMappingURL=RouteServiceProvider.js.map