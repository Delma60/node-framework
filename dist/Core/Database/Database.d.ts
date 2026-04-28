import { QueryBuilder } from './QueryBuilder';
export declare class Database extends QueryBuilder {
    private static sharedConnection;
    constructor();
    /**
     * 🚀 NEW: Initialize the master connection. Called by the Service Provider.
     */
    static initialize(config: any): void;
    /**
     * 🚀 CRITICAL NODE.JS FIX:
     * When a developer starts a query using DB.table(), we return a BRAND NEW
     * instance of the Database class. This prevents concurrent HTTP requests
     * from overwriting each other's SQL variables!
     */
    table(tableName: string): this;
    /**
     * Execute raw SQL directly, bypassing the builder state.
     */
    raw(sql: string, bindings?: any[]): Promise<any>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollBack(): Promise<void>;
}
//# sourceMappingURL=Database.d.ts.map