"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const HttpException_1 = require("./HttpException");
class NotFoundException extends HttpException_1.HttpException {
    constructor(message = 'The requested resource could not be found.') {
        super(404, message);
    }
}
exports.NotFoundException = NotFoundException;
//# sourceMappingURL=NotFoundException.js.map