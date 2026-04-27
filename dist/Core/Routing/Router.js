"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const Route_1 = require("./Route");
const RouteRegistrar_1 = require("./RouteRegistrar");
class Router {
    routes = [];
    groupStack = [];
    // --- Fluent Entry Points ---
    prefix(prefix) {
        return new RouteRegistrar_1.RouteRegistrar(this).prefix(prefix);
    }
    middleware(middleware) {
        return new RouteRegistrar_1.RouteRegistrar(this).middleware(middleware);
    }
    controller(controller) {
        return new RouteRegistrar_1.RouteRegistrar(this).controller(controller);
    }
    name(name) {
        return new RouteRegistrar_1.RouteRegistrar(this).name(name);
    }
    // --- Core Methods ---
    group(attributes, callback) {
        this.groupStack.push(attributes);
        callback();
        this.groupStack.pop();
    }
    get(uri, action) {
        return this.addRoute('get', uri, action);
    }
    post(uri, action) {
        return this.addRoute('post', uri, action);
    }
    delete(uri, action) {
        return this.addRoute('delete', uri, action);
    }
    addRoute(method, uri, action) {
        // 1. Create the new Route instance
        const route = new Route_1.Route(method, uri, action);
        // 2. Apply group attributes if we're in a group
        if (this.groupStack.length > 0) {
            const currentGroup = this.groupStack[this.groupStack.length - 1];
            if (currentGroup?.prefix) {
                route.prefix(currentGroup.prefix);
            }
            if (currentGroup?.middleware) {
                route.middleware(currentGroup.middleware);
            }
            if (currentGroup?.controller && typeof action === 'string') {
                // If action is a string method name and we have a controller, resolve it
                route.controller(currentGroup.controller.prototype[action].bind(currentGroup.controller));
            }
        }
        // 3. Save it to our collection
        this.routes.push(route);
        // 4. Return the instance so the user can chain ->name() or ->middleware()
        return route;
    }
    getRoutes() {
        return this.routes;
    }
    clear() {
        this.routes = [];
    }
}
exports.Router = Router;
//# sourceMappingURL=Router.js.map