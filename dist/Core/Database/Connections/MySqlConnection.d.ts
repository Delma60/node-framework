import { Connection } from './Connection';
export declare class MySqlConnection extends Connection {
    private pool;
    constructor(config: any);
    query(sql: string, bindings?: any[]): Promise<any>;
    select(sql: string, bindings?: any[]): Promise<any[]>;
    insert(sql: string, bindings?: any[]): Promise<number>;
    update(sql: string, bindings?: any[]): Promise<number>;
    delete(sql: string, bindings?: any[]): Promise<number>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollBack(): Promise<void>;
    getRawConnection(): any;
    private logQuery;
}
//# sourceMappingURL=MySqlConnection.d.ts.map