"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const Facade_1 = require("./Facade");
class RouteFacade extends Facade_1.Facade {
    static getFacadeAccessor() {
        // This MUST match what you bind in the RouteServiceProvider!
        return 'router';
    }
}
// 🚀 The Magic: We cast the Proxy to the Router type. 
// Now developers get perfect IDE autocomplete, even though it's a dynamic Proxy!
exports.Route = RouteFacade.createProxy();
//# sourceMappingURL=Route.js.map