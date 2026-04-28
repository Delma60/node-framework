"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Facade = void 0;
class Facade {
    // Holds the global application container
    static container;
    /**
     * The framework calls this during boot to give the Facades access to the container.
     */
    static setFacadeApplication(container) {
        Facade.container = container;
    }
    /**
     * Every specific Facade (like Route or DB) MUST override this method
     * to tell the proxy what key to look for in the container.
     */
    static getFacadeAccessor() {
        throw new Error('Facade does not implement getFacadeAccessor method.');
    }
    /**
     * The magic Proxy factory.
     */
    static createProxy() {
        return new Proxy({}, {
            get: (target, property) => {
                const accessor = this.getFacadeAccessor();
                if (!Facade.container) {
                    throw new Error("Facade application has not been set.");
                }
                // 1. Resolve the underlying instance from the IoC Container
                const instance = Facade.container.make(accessor);
                if (!instance) {
                    throw new Error(`A facade root has not been set for [${accessor}].`);
                }
                // 2. Grab the requested property/method
                const member = instance[property];
                // 3. If it's a method, bind it to the instance so 'this' doesn't break
                if (typeof member === 'function') {
                    return member.bind(instance);
                }
                return member;
            }
        });
    }
}
exports.Facade = Facade;
//# sourceMappingURL=Facade.js.map