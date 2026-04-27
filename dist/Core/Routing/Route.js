"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
class Route {
    method;
    uri;
    action;
    // Additional configuration for this specific route
    routeName;
    routeMiddleware = [];
    constructor(method, uri, action) {
        this.method = method;
        this.uri = uri;
        this.action = action;
    }
    /**
     * Name the route.
     */
    name(name) {
        this.routeName = name;
        return this; // Returns the route itself for chaining
    }
    /**
     * Assign middleware to the route.
     */
    middleware(middleware) {
        const middlewares = Array.isArray(middleware) ? middleware : [middleware];
        this.routeMiddleware.push(...middlewares);
        return this;
    }
    controller(controller) {
        this.action = controller;
        return this;
    }
    prefix(prefix) {
        this.uri = prefix + this.uri;
        return this;
    }
    group(callback) {
        callback(this);
        return this;
    }
}
exports.Route = Route;
//# sourceMappingURL=Route.js.map