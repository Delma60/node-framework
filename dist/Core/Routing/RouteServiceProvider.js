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
                    console.log("object");
                    context = instance;
                }
            }
            else if (controller && typeof controller === 'object') {
                console.log("object");
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
        this.app.bind('router', (0, express_1.default)());
    }
    async boot() {
        const server = this.app.make('router');
        const options = this.app.make('routing.options');
        server.use(express_1.default.json());
        // 3. Dynamically import and map the Web routes
        if (options && options.web) {
            Route_1.Route.clear();
            await Promise.resolve(`${this.resolveRouteFile(options.web)}`).then(s => __importStar(require(s)));
            // Ask the Router instance for the collection of Route objects
            const webRoutes = Route_1.Route.getRoutes();
            for (const route of webRoutes) {
                // At this point, you could also map route.routeMiddleware into Express!
                if (server) {
                    const method = route.method;
                    if (typeof server[method] === 'function') {
                        const rawHandler = this.resolveRouteHandler(route);
                        if (rawHandler) {
                            // 🚀 Wrap the handler here before giving it to Express!
                            const expressHandler = this.wrapHandler(rawHandler);
                            server[method](route.uri, expressHandler);
                        }
                        else {
                        }
                    }
                }
            }
        }
        // 4. Dynamically import and map the API routes (with an automatic prefix!)
        if (options && options.api) {
            // Clear any existing routes and load API routes using Route facade
            Route_1.Route.clear();
            await Promise.resolve(`${this.resolveRouteFile(options.api)}`).then(s => __importStar(require(s)));
            // Get the API routes from the Route facade
            const apiRoutes = Route_1.Route.getRoutes();
            // Create API router and apply /api prefix
            const apiRouter = express_1.default.Router();
            for (const route of apiRoutes) {
                const method = route.method;
                if (typeof apiRouter[method] === 'function') {
                    const rawHandler = this.resolveRouteHandler(route);
                    if (rawHandler) {
                        // 🚀 Wrap the handler here before giving it to Express!
                        const expressHandler = this.wrapHandler(rawHandler);
                        apiRouter[method](route.uri, expressHandler);
                    }
                    else {
                        console.warn(`Skipping API route ${route.method.toUpperCase()} /api${route.uri} because the handler is not a function.`);
                    }
                }
            }
            // Mount all API routes under the '/api' prefix automatically
            server.use('/api', apiRouter);
        }
        server.listen(3000, () => {
            console.log('🚀 Server is running on http://localhost:3000');
        });
    }
}
exports.RouteServiceProvider = RouteServiceProvider;
//# sourceMappingURL=RouteServiceProvider.js.map