import { Connection } from './Connections/Connection';
import { MySqlConnection } from './Connections/MySqlConnection';

type DriverFactory = (config: any) => Connection;
export class DatabaseManager {
    protected config: any;
    protected connections: Map<string, Connection> = new Map();
    protected customCreators: Map<string, DriverFactory> = new Map();

    constructor(config: any) {
        this.config = config;
        
        // Register default drivers
        this.extend('mysql', (config) => new MySqlConnection(config));
    }

    // Allow extending the manager with new drivers
    public extend(driver: string, callback: DriverFactory): this {
        this.customCreators.set(driver, callback);
        return this;
    }

    public connection(name: string = 'mysql'): Connection {
        const connName = name || this.config.default;

        if (!this.connections.has(connName)) {
            this.connections.set(connName, this.makeConnection(connName));
        }

        return this.connections.get(connName)!;
    }

    protected makeConnection(name: string): Connection {
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
    public table(table: string) {
        return this.connection().table(table);
    }

    public async query(sql: string, bindings: any[] = []): Promise<any> {
        return this.connection().query(sql, bindings);
    }

    public async select(sql: string, bindings: any[] = []): Promise<any[]> {
        return this.connection().select(sql, bindings);
    }

    public async insert(sql: string, bindings: any[] = []): Promise<number> {
        return this.connection().insert(sql, bindings);
    }

    public async update(sql: string, bindings: any[] = []): Promise<number> {
        return this.connection().update(sql, bindings);
    }

    public async delete(sql: string, bindings: any[] = []): Promise<number> {
        return this.connection().delete(sql, bindings);
    }

    public async beginTransaction(): Promise<void> {
        return this.connection().beginTransaction();
    }

    public async commit(): Promise<void> {
        return this.connection().commit();
    }

    public async rollBack(): Promise<void> {
        return this.connection().rollBack();
    }
}
