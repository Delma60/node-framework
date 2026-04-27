"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const HttpException_1 = require("./HttpException");
class ValidationException extends HttpException_1.HttpException {
    errors;
    constructor(errors = {}, message = 'The given data was invalid.') {
        super(422, message);
        this.errors = errors;
    }
}
exports.ValidationException = ValidationException;
//# sourceMappingURL=ValidationException.js.map