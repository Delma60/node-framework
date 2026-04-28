import { DB } from "../../../Core/Facade/DB";
import { Request } from "../../../Core/Http/Request";
import { Controller } from "./Controller";

export class UserController extends Controller {
    public async index(request: Request) {
        const all = request.all()
        const users = await DB.table('users').first();
        return users;
    }

    public store(request: Request) {
        const data = request.validate({
            name: 'required|string',
        });
        

        return `User created with name: ${data.name}`;
    }
}