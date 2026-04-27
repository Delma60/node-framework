"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteRegistrar = void 0;
class RouteRegistrar {
    router;
    // The bucket holding the chained attributes
    attributes = {};
    constructor(router) {
        this.router = router;
    }
    /**
     * Add a prefix to the bucket and return this registrar to allow more chaining.
     */
    prefix(prefix) {
        this.attributes.prefix = prefix;
        return this;
    }
    /**
     * Add middleware to the bucket.
     */
    middleware(middleware) {
        this.attributes.middleware = Array.isArray(middleware) ? middleware : [middleware];
        return this;
    }
    /**
     * Add a controller to the bucket.
     */
    controller(controller) {
        this.attributes.controller = controller;
        return this;
    }
    /**
     * The final call! Pass the collected attributes back to the main Router.
     */
    group(callback) {
        this.router.group(this.attributes, callback);
    }
    name(name) {
        this.attributes.routeName = name;
        return this;
    }
}
exports.RouteRegistrar = RouteRegistrar;
//# sourceMappingURL=RouteRegistrar.js.map