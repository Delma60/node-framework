import { QueryBuilder } from '../QueryBuilder';
export declare abstract class Connection {
    protected config: any;
    protected inTransaction: boolean;
    constructor(config: any);
    /**
     * Begin a fluent query against a database table.
     */
    table(table: string): QueryBuilder;
    abstract query(sql: string, bindings?: any[]): Promise<any>;
    abstract select(sql: string, bindings?: any[]): Promise<any[]>;
    abstract insert(sql: string, bindings?: any[]): Promise<number>;
    abstract update(sql: string, bindings?: any[]): Promise<number>;
    abstract delete(sql: string, bindings?: any[]): Promise<number>;
    abstract beginTransaction(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract rollBack(): Promise<void>;
}
//# sourceMappingURL=Connection.d.ts.map