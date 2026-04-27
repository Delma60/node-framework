"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRegistrar = void 0;
class ResourceRegistrar {
    routes;
    constructor(routes) {
        this.routes = routes;
    }
    middleware(middleware) {
        const middlewares = Array.isArray(middleware) ? middleware : [middleware];
        for (const route of this.routes) {
            route.middleware(middlewares);
        }
        return this;
    }
    prefix(prefix) {
        for (const route of this.routes) {
            route.prefix(prefix);
        }
        return this;
    }
    name(name) {
        for (const route of this.routes) {
            route.name(name);
        }
        return this;
    }
}
exports.ResourceRegistrar = ResourceRegistrar;
//# sourceMappingURL=ResourceRegistrar.js.map