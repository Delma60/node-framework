"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
class Container {
    // Protected so the Application class can access it if absolutely necessary,
    // though we should generally stick to using bind() and make().
    bindings = new Map();
    /**
     * Bind a service into the container.
     */
    bind(key, instance) {
        this.bindings.set(key, instance);
    }
    /**
     * Resolve a service out of the container.
     */
    make(key) {
        if (!this.bindings.has(key)) {
            throw new Error(`Service [${key}] not found in container.`);
        }
        return this.bindings.get(key);
    }
}
exports.Container = Container;
//# sourceMappingURL=Container.js.map