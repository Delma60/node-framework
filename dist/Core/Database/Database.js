"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const QueryBuilder_1 = require("./QueryBuilder");
const Connection_1 = require("./Connection");
class Database extends QueryBuilder_1.QueryBuilder {
    // Start as undefined so we don't connect until the framework tells us to
    static sharedConnection;
    constructor() {
        if (!Database.sharedConnection) {
            throw new Error("Database connection has not been initialized. Call Database.initialize(config) during app bootstrap.");
        }
        super(Database.sharedConnection);
    }
    /**
     * 🚀 NEW: Initialize the master connection. Called by the Service Provider.
     */
    static initialize(config) {
        if (!Database.sharedConnection) {
            // Grab the specific config for the default driver (e.g., 'mysql')
            const activeConfig = config.connections[config.default];
            Database.sharedConnection = new Connection_1.Connection(activeConfig);
        }
    }
    /**
     * 🚀 CRITICAL NODE.JS FIX:
     * When a developer starts a query using DB.table(), we return a BRAND NEW
     * instance of the Database class. This prevents concurrent HTTP requests
     * from overwriting each other's SQL variables!
     */
    table(tableName) {
        const freshInstance = new Database();
        freshInstance.tableName = tableName; // Accessing the protected property
        return freshInstance;
    }
    // --- Global Database Methods ---
    /**
     * Execute raw SQL directly, bypassing the builder state.
     */
    async raw(sql, bindings = []) {
        return Database.sharedConnection.query(sql, bindings);
    }
    // Transaction wrappers routing to the shared connection
    async beginTransaction() {
        return Database.sharedConnection.beginTransaction();
    }
    async commit() {
        return Database.sharedConnection.commit();
    }
    async rollBack() {
        return Database.sharedConnection.rollBack();
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map