"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
class Middleware {
    aliases = {};
    // Arrays to hold class references for specific route groups
    webGroup = [];
    apiGroup = [];
    // Express trust proxy configuration
    trustedProxies = false;
    /**
     * Register route middleware aliases.
     */
    alias(aliases) {
        this.aliases = { ...this.aliases, ...aliases };
        return this;
    }
    /**
     * Append middlewares to the 'web' route group.
     */
    web(middlewares) {
        this.webGroup.push(...middlewares);
        return this;
    }
    /**
     * Append middlewares to the 'api' route group.
     */
    api(middlewares) {
        this.apiGroup.push(...middlewares);
        return this;
    }
    /**
     * Configure trusted proxies for the application.
     */
    trustProxies(proxies) {
        this.trustedProxies = proxies;
        return this;
    }
}
exports.Middleware = Middleware;
//# sourceMappingURL=Middleware.js.map