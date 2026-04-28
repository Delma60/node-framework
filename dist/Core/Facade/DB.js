"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const Facade_1 = require("./Facade");
class DBFacade extends Facade_1.Facade {
    static getFacadeAccessor() {
        return 'db';
    }
}
exports.DB = DBFacade.createProxy();
//# sourceMappingURL=DB.js.map