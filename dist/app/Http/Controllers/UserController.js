"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const Controller_1 = require("./Controller");
class UserController extends Controller_1.Controller {
    index(request) {
        const all = request.all();
        // console.log({ all })
        return "User index";
    }
    store(request) {
        throw new Error("Store method not implemented yet.");
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map