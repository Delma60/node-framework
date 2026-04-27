import { Request } from "../../../Core/Http/Request";
import { Controller } from "./Controller";

export class UserController extends Controller {
    public index(request: Request) {
        const all = request.all()
        // console.log({ all })
        return "User index";
    }
}