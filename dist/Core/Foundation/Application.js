"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
// src/foundation/Application.ts
const RouteServiceProvider_1 = require("../Routing/RouteServiceProvider");
const Middleware_1 = require("./Configurations/Middleware");
const Container_1 = require("./Container");
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
        return (new Application(basePath)).withProviders([
            RouteServiceProvider_1.RouteServiceProvider,
        ]);
    }
    // --- All methods below are now INSTANCE methods ---
    withMiddleware(callback) {
        const middleware = new Middleware_1.Middleware();
        if (callback) {
            callback(middleware);
        }
        return this;
    }
    withRouting(options) {
        this.bind('routing.options', options);
        return this;
    }
    create() {
        console.log(`✅ Application built with base path: ${this.basePath}`);
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
            console.log(`Registering provider: ${ProviderClass.name}`);
            this.register(ProviderClass);
        }
        return this;
    }
    async boot() {
        console.log(`🚀 Booting application...`);
        for (const provider of this.providers) {
            console.log(`Booting provider: ${provider.constructor.name}`);
            if (provider.boot) {
                await provider.boot();
            }
        }
        console.log("🚀 Application booted successfully.");
    }
}
exports.Application = Application;
//# sourceMappingURL=Application.js.map