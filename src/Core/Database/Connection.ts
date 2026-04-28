import mysql from 'mysql2/promise';

export class Connection {
    private pool: any;
    private inTransaction: boolean = false;
    private config: any;

    // 🚀 NEW: Accept the specific connection config (e.g., the mysql object)
    constructor(config: any) {
        this.config = config;
        
        console.log(`🔌 [DB] Initialized ${this.config.driver} connection to ${this.config.host || this.config.database}`);

        if (config.driver === 'mysql') {
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
        } else {
            throw new Error(`Unsupported database driver: ${config.driver}`);
        }
    }

    /**
     * The master query executor. All specific methods flow through here.
     */
    public async query(sql: string, bindings: any[] = []): Promise<any> {
        this.logQuery(sql, bindings);

        if (!this.pool) {
            throw new Error('Database connection pool is not initialized.');
        }

        const [rows] = await this.pool.execute(sql, bindings);
        return rows;
    }

    // --- Specific CRUD Helpers ---

    public async select(sql: string, bindings: any[] = []): Promise<any[]> {
        // In real drivers like mysql2, the rows are usually the first element in the array
        const result = await this.query(sql, bindings);
        return Array.isArray(result) ? result : result[0] || [];
    }

    public async insert(sql: string, bindings: any[] = []): Promise<number> {
        const result = await this.query(sql, bindings);
        return result.insertId; // Returns the ID of the newly inserted row
    }

    public async update(sql: string, bindings: any[] = []): Promise<number> {
        const result = await this.query(sql, bindings);
        return result.affectedRows; // Returns how many rows were updated
    }

    public async delete(sql: string, bindings: any[] = []): Promise<number> {
        const result = await this.query(sql, bindings);
        return result.affectedRows; // Returns how many rows were deleted
    }

    // --- Transaction Support ---

    public async beginTransaction(): Promise<void> {
        console.log(`🐘 [DB Transaction]: START TRANSACTION`);
        this.inTransaction = true;
        // await this.pool.query('START TRANSACTION');
    }

    public async commit(): Promise<void> {
        if (!this.inTransaction) throw new Error("No transaction is active.");
        console.log(`🐘 [DB Transaction]: COMMIT`);
        this.inTransaction = false;
        // await this.pool.query('COMMIT');
    }

    public async rollBack(): Promise<void> {
        if (!this.inTransaction) throw new Error("No transaction is active.");
        console.log(`🐘 [DB Transaction]: ROLLBACK`);
        this.inTransaction = false;
        // await this.pool.query('ROLLBACK');
    }

    // --- Helpers ---

    private logQuery(sql: string, bindings: any[]): void {
        let logQuery = sql;
        bindings.forEach(binding => {
            const value = typeof binding === 'string' ? `'${binding}'` : binding;
            logQuery = logQuery.replace('?', String(value));
        });
        console.log(`🐘 [DB]: ${logQuery}`);
    }
}