"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const Connection_1 = require("./Connections/Connection");
const promise_1 = __importDefault(require("mysql2/promise"));
class Connection extends Connection_1.Connection {
    pool;
    inTransaction = false;
    // 🚀 NEW: Accept the specific connection config (e.g., the mysql object)
    constructor(config) {
        super(config);
        console.log(`🔌 [DB] Initialized ${this.config.driver} connection to ${this.config.host || this.config.database}`);
        if (config.driver === 'mysql') {
            this.pool = promise_1.default.createPool({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database,
                waitForConnections: true,
                connectionLimit: config.connectionLimit || 10,
                queueLimit: 0,
            });
        }
        else {
            throw new Error(`Unsupported database driver: ${config.driver}`);
        }
    }
    /**
     * The master query executor. All specific methods flow through here.
     */
    async query(sql, bindings = []) {
        this.logQuery(sql, bindings);
        if (!this.pool) {
            throw new Error('Database connection pool is not initialized.');
        }
        const [rows] = await this.pool.execute(sql, bindings);
        return rows;
    }
    // --- Specific CRUD Helpers ---
    async select(sql, bindings = []) {
        // In real drivers like mysql2, the rows are usually the first element in the array
        const result = await this.query(sql, bindings);
        return Array.isArray(result) ? result : result[0] || [];
    }
    async insert(sql, bindings = []) {
        const result = await this.query(sql, bindings);
        return result.insertId; // Returns the ID of the newly inserted row
    }
    async update(sql, bindings = []) {
        const result = await this.query(sql, bindings);
        return result.affectedRows; // Returns how many rows were updated
    }
    async delete(sql, bindings = []) {
        const result = await this.query(sql, bindings);
        return result.affectedRows; // Returns how many rows were deleted
    }
    // --- Transaction Support ---
    async beginTransaction() {
        console.log(`🐘 [DB Transaction]: START TRANSACTION`);
        this.inTransaction = true;
        // await this.pool.query('START TRANSACTION');
    }
    async commit() {
        if (!this.inTransaction)
            throw new Error("No transaction is active.");
        console.log(`🐘 [DB Transaction]: COMMIT`);
        this.inTransaction = false;
        // await this.pool.query('COMMIT');
    }
    async rollBack() {
        if (!this.inTransaction)
            throw new Error("No transaction is active.");
        console.log(`🐘 [DB Transaction]: ROLLBACK`);
        this.inTransaction = false;
        // await this.pool.query('ROLLBACK');
    }
    getDriverName() {
        return this.config.driver;
    }
    getRawConnection() {
        return this.pool;
    }
    // --- Helpers ---
    logQuery(sql, bindings) {
        let logQuery = sql;
        bindings.forEach(binding => {
            const value = typeof binding === 'string' ? `'${binding}'` : binding;
            logQuery = logQuery.replace('?', String(value));
        });
        console.log(`🐘 [DB]: ${logQuery}`);
    }
}
exports.Connection = Connection;
//# sourceMappingURL=Connection.js.map