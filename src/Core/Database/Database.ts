import { QueryBuilder } from './QueryBuilder';
import { Connection } from './Connection';

export class Database extends QueryBuilder {
    // Start as undefined so we don't connect until the framework tells us to
    private static sharedConnection: Connection;

    constructor() {
        if (!Database.sharedConnection) {
            throw new Error("Database connection has not been initialized. Call Database.initialize(config) during app bootstrap.");
        }
        super(Database.sharedConnection);
    }


    

    /**
     * 🚀 NEW: Initialize the master connection. Called by the Service Provider.
     */
    public static initialize(config: any): void {
        if (!Database.sharedConnection) {
            // Grab the specific config for the default driver (e.g., 'mysql')
            const activeConfig = config.connections[config.default];
            Database.sharedConnection = new Connection(activeConfig);
        }
    }

    /**
     * 🚀 CRITICAL NODE.JS FIX:
     * When a developer starts a query using DB.table(), we return a BRAND NEW
     * instance of the Database class. This prevents concurrent HTTP requests 
     * from overwriting each other's SQL variables!
     */
    public table(tableName: string): this {
        const freshInstance = new Database();
        (freshInstance as any).tableName = tableName; // Accessing the protected property
        return freshInstance as this;
    }

    // --- Global Database Methods ---

    /**
     * Execute raw SQL directly, bypassing the builder state.
     */
    public async raw(sql: string, bindings: any[] = []): Promise<any> {
        return Database.sharedConnection.query(sql, bindings);
    }

    // Transaction wrappers routing to the shared connection
    public async beginTransaction(): Promise<void> {
        return Database.sharedConnection.beginTransaction();
    }

    public async commit(): Promise<void> {
        return Database.sharedConnection.commit();
    }

    public async rollBack(): Promise<void> {
        return Database.sharedConnection.rollBack();
    }
}
