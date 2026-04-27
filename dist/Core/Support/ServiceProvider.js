"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProvider = void 0;
class ServiceProvider {
    /**
     * The application/container instance.
     * Marked as protected so any class extending this one can access it via `this.app`.
     */
    app;
    constructor(app) {
        this.app = app;
    }
    /**
     * Phase 2: Bootstrap any application services.
     * * This method is called after ALL other service providers have
     * been registered. Here, you can safely resolve any service from
     * the container knowing that they are fully available.
     * * (We provide an empty default implementation so child classes
     * aren't forced to write a boot method if they only need to register things).
     */
    async boot() {
        // Leave empty by default
    }
}
exports.ServiceProvider = ServiceProvider;
//# sourceMappingURL=ServiceProvider.js.map