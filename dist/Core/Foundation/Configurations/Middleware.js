"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
class Middleware {
    aliases = {};
    /**
     * Register route middleware aliases.
     */
    alias(aliases) {
        this.aliases = { ...this.aliases, ...aliases };
        return this;
    }
}
exports.Middleware = Middleware;
//# sourceMappingURL=Middleware.js.map