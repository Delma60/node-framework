import { QueryBuilder } from '../QueryBuilder';
export declare abstract class Connection {
    protected config: any;
    protected inTransaction: boolean;
    constructor(config: any);
    table(table: string): QueryBuilder;
    getDriverName(): string;
    protected logQuery(sql: string, bindings: any[]): void;
    getName(): any;
    abstract getRawConnection(): any;
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