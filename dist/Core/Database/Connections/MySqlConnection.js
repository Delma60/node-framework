"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlConnection = void 0;
const Connection_1 = require("./Connection");
class MySqlConnection extends Connection_1.Connection {
    pool;
    constructor(config) {
        super(config);
        console.log(`🔌 [MySQL] Initialized connection to database: ${config.database}`);
        try {
            const mysql = require('mysql2/promise');
            this.pool = mysql.createPool({
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
        catch (error) {
            throw new Error("Please install 'mysql2' to use the MySQL driver.");
        }
    }
    async query(sql, bindings = []) {
        this.logQuery(sql, bindings);
        if (!this.pool) {
            throw new Error('MySQL pool is not initialized.');
        }
        const [rows] = await this.pool.execute(sql, bindings);
        return rows;
    }
    async select(sql, bindings = []) {
        const rows = await this.query(sql, bindings);
        return Array.isArray(rows) ? rows : rows[0] || [];
    }
    async insert(sql, bindings = []) {
        const result = await this.query(sql, bindings);
        return result.insertId || result[0]?.insertId || 0;
    }
    async update(sql, bindings = []) {
        const result = await this.query(sql, bindings);
        return result.affectedRows || result[0]?.affectedRows || 0;
    }
    async delete(sql, bindings = []) {
        const result = await this.query(sql, bindings);
        return result.affectedRows || result[0]?.affectedRows || 0;
    }
    async beginTransaction() {
        console.log('🐘 [DB Transaction]: START TRANSACTION');
        this.inTransaction = true;
    }
    async commit() {
        if (!this.inTransaction)
            throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: COMMIT');
        this.inTransaction = false;
    }
    async rollBack() {
        if (!this.inTransaction)
            throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: ROLLBACK');
        this.inTransaction = false;
    }
    logQuery(sql, bindings) {
        let logQuery = sql;
        bindings.forEach(binding => {
            const value = typeof binding === 'string' ? `'${binding}'` : binding;
            logQuery = logQuery.replace('?', String(value));
        });
        console.log(`🐘 [MySQL]: ${logQuery}`);
    }
}
exports.MySqlConnection = MySqlConnection;
//# sourceMappingURL=MySqlConnection.js.map