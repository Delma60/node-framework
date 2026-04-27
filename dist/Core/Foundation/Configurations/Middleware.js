"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
class Middleware {
    aliases = {};
    webGroup = [];
    apiGroup = [];
    // 🚀 NEW: Store global middlewares here
    globalMiddlewares = [];
    trustedProxies = false;
    alias(aliases) {
        this.aliases = { ...this.aliases, ...aliases };
        return this;
    }
    web(middlewares) {
        this.webGroup.push(...middlewares);
        return this;
    }
    api(middlewares) {
        this.apiGroup.push(...middlewares);
        return this;
    }
    // 🚀 NEW: Append global middleware that runs on EVERY request
    append(middleware) {
        this.globalMiddlewares.push(middleware);
        return this;
    }
    trustProxies(proxies) {
        this.trustedProxies = proxies;
        return this;
    }
}
exports.Middleware = Middleware;
//# sourceMappingURL=Middleware.js.map