import { Connection } from './Connections/Connection';
export declare class DatabaseManager {
    protected config: any;
    protected connections: Map<string, Connection>;
    constructor(config: any);
    connection(name?: string): Connection;
    protected makeConnection(name: string): Connection;
    table(table: string): import("./QueryBuilder").QueryBuilder;
    query(sql: string, bindings?: any[]): Promise<any>;
    select(sql: string, bindings?: any[]): Promise<any[]>;
    insert(sql: string, bindings?: any[]): Promise<number>;
    update(sql: string, bindings?: any[]): Promise<number>;
    delete(sql: string, bindings?: any[]): Promise<number>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollBack(): Promise<void>;
}
//# sourceMappingURL=DatabaseManager.d.ts.map