"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlConnection = void 0;
const Connection_1 = require("./Connection");
class MySqlConnection extends Connection_1.Connection {
    pool;
    transactionConnection = null; // Holds the active transaction
    constructor(config) {
        super(config);
        const mysql = require('mysql2/promise');
        this.pool = mysql.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
        });
    }
    async query(sql, bindings = []) {
        this.logQuery(sql, bindings);
        // Use the transaction connection if active, otherwise use the pool
        const executor = this.transactionConnection || this.pool;
        const [rows] = await executor.execute(sql, bindings);
        return rows;
    }
    // ... select, insert, update, delete wrappers ...
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
        if (this.transactionConnection)
            throw new Error('Transaction already active.');
        this.transactionConnection = await this.pool.getConnection();
        console.log('🐘 [DB Transaction]: START TRANSACTION');
        await this.transactionConnection.beginTransaction();
    }
    async commit() {
        if (!this.transactionConnection)
            throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: COMMIT');
        await this.transactionConnection.commit();
        this.transactionConnection.release();
        this.transactionConnection = null;
    }
    async rollBack() {
        if (!this.transactionConnection)
            throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: ROLLBACK');
        await this.transactionConnection.rollback();
        this.transactionConnection.release();
        this.transactionConnection = null;
    }
    getRawConnection() {
        return this.pool;
    }
}
exports.MySqlConnection = MySqlConnection;
//# sourceMappingURL=MySqlConnection.js.map