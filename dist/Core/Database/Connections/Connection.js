"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const QueryBuilder_1 = require("../QueryBuilder");
class Connection {
    config;
    inTransaction = false;
    constructor(config) {
        this.config = config;
    }
    /**
     * Begin a fluent query against a database table.
     */
    table(table) {
        return new QueryBuilder_1.QueryBuilder(this).table(table);
    }
}
exports.Connection = Connection;
//# sourceMappingURL=Connection.js.map