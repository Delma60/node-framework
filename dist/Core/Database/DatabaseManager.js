"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const MySqlConnection_1 = require("./Connections/MySqlConnection");
class DatabaseManager {
    config;
    connections = new Map();
    customCreators = new Map();
    constructor(config) {
        this.config = config;
        // Register default drivers
        this.extend('mysql', (config) => new MySqlConnection_1.MySqlConnection(config));
    }
    // Allow extending the manager with new drivers
    extend(driver, callback) {
        this.customCreators.set(driver, callback);
        return this;
    }
    connection(name = 'mysql') {
        const connName = name || this.config.default;
        if (!this.connections.has(connName)) {
            this.connections.set(connName, this.makeConnection(connName));
        }
        return this.connections.get(connName);
    }
    makeConnection(name) {
        const dbConfig = this.config.connections[name];
        if (!dbConfig) {
            throw new Error(`Database connection [${name}] not configured.`);
        }
        const creator = this.customCreators.get(dbConfig.driver);
        if (!creator) {
            throw new Error(`Unsupported database driver [${dbConfig.driver}].`);
        }
        return creator(dbConfig);
    }
    // Dynamic proxy to forward calls to the default connection (e.g., DB.table('users'))
    table(table) {
        return this.connection().table(table);
    }
    async query(sql, bindings = []) {
        return this.connection().query(sql, bindings);
    }
    async select(sql, bindings = []) {
        return this.connection().select(sql, bindings);
    }
    async insert(sql, bindings = []) {
        return this.connection().insert(sql, bindings);
    }
    async update(sql, bindings = []) {
        return this.connection().update(sql, bindings);
    }
    async delete(sql, bindings = []) {
        return this.connection().delete(sql, bindings);
    }
    async beginTransaction() {
        return this.connection().beginTransaction();
    }
    async commit() {
        return this.connection().commit();
    }
    async rollBack() {
        return this.connection().rollBack();
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map