import { Connection } from './Connection';

export class MySqlConnection extends Connection {
    private pool: any;
    private transactionConnection: any = null; // Holds the active transaction

    constructor(config: any) {
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

    public async query(sql: string, bindings: any[] = []): Promise<any> {
        this.logQuery(sql, bindings);
        
        // Use the transaction connection if active, otherwise use the pool
        const executor = this.transactionConnection || this.pool;
        const [rows] = await executor.execute(sql, bindings);
        return rows;
    }

    // ... select, insert, update, delete wrappers ...
    public async select(sql: string, bindings: any[] = []): Promise<any[]> {
        const rows = await this.query(sql, bindings);
        return Array.isArray(rows) ? rows : rows[0] || [];
    }
    
    public async insert(sql: string, bindings: any[] = []): Promise<number> {
        const result = await this.query(sql, bindings);
        return result.insertId || result[0]?.insertId || 0;
    }
    
    public async update(sql: string, bindings: any[] = []): Promise<number> {
        const result = await this.query(sql, bindings);
        return result.affectedRows || result[0]?.affectedRows || 0;
    }
    
    public async delete(sql: string, bindings: any[] = []): Promise<number> {
        const result = await this.query(sql, bindings);
        return result.affectedRows || result[0]?.affectedRows || 0;
    }

    public async beginTransaction(): Promise<void> {
        if (this.transactionConnection) throw new Error('Transaction already active.');
        this.transactionConnection = await this.pool.getConnection();
        console.log('🐘 [DB Transaction]: START TRANSACTION');
        await this.transactionConnection.beginTransaction();
    }

    public async commit(): Promise<void> {
        if (!this.transactionConnection) throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: COMMIT');
        await this.transactionConnection.commit();
        this.transactionConnection.release();
        this.transactionConnection = null;
    }

    public async rollBack(): Promise<void> {
        if (!this.transactionConnection) throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: ROLLBACK');
        await this.transactionConnection.rollback();
        this.transactionConnection.release();
        this.transactionConnection = null;
    }

    public getRawConnection(): any {
        return this.pool;
    }
}