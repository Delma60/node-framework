import { QueryBuilder } from '../QueryBuilder';

export abstract class Connection {
    protected config: any;
    protected inTransaction: boolean = false;

    constructor(config: any) {
        this.config = config;
    }

    /**
     * Begin a fluent query against a database table.
     */
    public table(table: string): QueryBuilder {
        return new QueryBuilder(this as any).table(table);
    }

    public getDriverName(): string {
        return this.config.driver;
    }

    public abstract getRawConnection(): any;

    public abstract query(sql: string, bindings?: any[]): Promise<any>;
    public abstract select(sql: string, bindings?: any[]): Promise<any[]>;
    public abstract insert(sql: string, bindings?: any[]): Promise<number>;
    public abstract update(sql: string, bindings?: any[]): Promise<number>;
    public abstract delete(sql: string, bindings?: any[]): Promise<number>;

    public abstract beginTransaction(): Promise<void>;
    public abstract commit(): Promise<void>;
    public abstract rollBack(): Promise<void>;
}
