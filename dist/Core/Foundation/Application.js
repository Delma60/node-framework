"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
// src/foundation/Application.ts
const RouteServiceProvider_1 = require("../Routing/RouteServiceProvider");
const Middleware_1 = require("./Configurations/Middleware");
const Container_1 = require("./Container");
const Handler_1 = require("./Exceptions/Handler");
class Application extends Container_1.Container {
    // Instance properties, not static!
    basePath;
    providers = [];
    // The constructor sets up the initial state
    constructor(basePath = "") {
        super();
        this.basePath = basePath;
        // Bonus: Bind the app to itself so providers can resolve the core app if needed
        this.bind('app', this);
    }
    /**
     * The Laravel 11 Entry Point (Static Factory)
     * This allows: Application.configure(path).withRouting(...).create()
     */
    static configure(basePath) {
        return (new Application(basePath))
            .withProviders([
            RouteServiceProvider_1.RouteServiceProvider,
        ])
            .withExceptions();
    }
    // --- All methods below are now INSTANCE methods ---
    withMiddleware(callback) {
        const middleware = new Middleware_1.Middleware();
        if (callback) {
            callback(middleware);
        }
        // 🚀 NEW: Bind the configured middleware instance into the container!
        this.bind('middleware', middleware);
        return this;
    }
    withExceptions(callback) {
        // 1. Create the default exception handler
        const handler = new Handler_1.ExceptionHandler();
        // 2. If the developer wants to add custom logic later, they can use the callback
        if (callback) {
            callback(handler);
        }
        // 3. Bind it to the container so the Router can grab it later
        this.bind('exception.handler', handler);
        return this;
    }
    withRouting(options) {
        this.bind('routing.options', options);
        return this;
    }
    create() {
        this.boot();
        return this;
    }
    register(ProviderClass) {
        // 'this' is now properly an Application instance!
        const provider = new ProviderClass(this);
        provider.register();
        this.providers.push(provider);
    }
    withProviders(providers) {
        for (const ProviderClass of providers) {
            this.register(ProviderClass);
        }
        return this;
    }
    async boot() {
        for (const provider of this.providers) {
            if (provider.boot) {
                await provider.boot();
            }
        }
    }
}
exports.Application = Application;
//# sourceMappingURL=Application.js.map