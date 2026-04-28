import { Connection } from './Connections/Connection';
import { MySqlConnection } from './Connections/MySqlConnection';

export class DatabaseManager {
    protected config: any;
    protected connections: Map<string, Connection> = new Map();

    constructor(config: any) {
        this.config = config;
    }

    public connection(name?: string): Connection {
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

        switch (dbConfig.driver) {
            case 'mysql':
                return new MySqlConnection(dbConfig);
            case 'postgres':
                throw new Error('Postgres driver not implemented yet.');
            case 'sqlite':
                throw new Error('SQLite driver not implemented yet.');
            default:
                throw new Error(`Unsupported database driver [${dbConfig.driver}].`);
        }
    }

    public driver(name?: string): Connection {
        return this.connection(name);
    }

    public connect(name?: string): Connection {
        return this.connection(name);
    }

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
