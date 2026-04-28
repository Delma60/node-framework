import { Connection } from './Connection';

export class MySqlConnection extends Connection {
    private pool: any;

    constructor(config: any) {
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
        } catch (error) {
            throw new Error("Please install 'mysql2' to use the MySQL driver.");
        }
    }

    public async query(sql: string, bindings: any[] = []): Promise<any> {
        this.logQuery(sql, bindings);

        if (!this.pool) {
            throw new Error('MySQL pool is not initialized.');
        }

        const [rows] = await this.pool.execute(sql, bindings);
        return rows;
    }

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
        console.log('🐘 [DB Transaction]: START TRANSACTION');
        this.inTransaction = true;
    }

    public async commit(): Promise<void> {
        if (!this.inTransaction) throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: COMMIT');
        this.inTransaction = false;
    }

    public async rollBack(): Promise<void> {
        if (!this.inTransaction) throw new Error('No transaction is active.');
        console.log('🐘 [DB Transaction]: ROLLBACK');
        this.inTransaction = false;
    }

    public getRawConnection(): any {
        return this.pool;
    }

    private logQuery(sql: string, bindings: any[]): void {
        let logQuery = sql;
        bindings.forEach(binding => {
            const value = typeof binding === 'string' ? `'${binding}'` : binding;
            logQuery = logQuery.replace('?', String(value));
        });
        console.log(`🐘 [MySQL]: ${logQuery}`);
    }
}
