"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
// src/Core/Database/Connections/Connection.ts
const QueryBuilder_1 = require("../QueryBuilder");
class Connection {
    config;
    inTransaction = false;
    constructor(config) {
        this.config = config;
    }
    table(table) {
        return new QueryBuilder_1.QueryBuilder(this).table(table);
    }
    getDriverName() {
        return this.config.driver;
    }
    logQuery(sql, bindings) {
        let logQuery = sql;
        bindings.forEach(binding => {
            const value = typeof binding === 'string' ? `'${binding}'` : binding;
            logQuery = logQuery.replace('?', String(value));
        });
        console.log(`[DB] [${this.getDriverName()}]: ${logQuery}`);
    }
    getName() {
        return this.config.connectionName || 'default';
    }
}
exports.Connection = Connection;
//# sourceMappingURL=Connection.js.map