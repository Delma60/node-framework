"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const DB_1 = require("../../../Core/Facade/DB");
const Controller_1 = require("./Controller");
class UserController extends Controller_1.Controller {
    async index(request) {
        const users = await DB_1.DB.table('users').first();
        const connection = DB_1.DB.connection().getName();
        console.log(`Using connection: ${connection}`);
        return users;
    }
    store(request) {
        const data = request.validate({
            name: 'required|string',
        });
        return `User created with name: ${data.name}`;
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map