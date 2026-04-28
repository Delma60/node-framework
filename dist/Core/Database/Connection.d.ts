export declare class Connection {
    private pool;
    private inTransaction;
    private config;
    constructor(config: any);
    /**
     * The master query executor. All specific methods flow through here.
     */
    query(sql: string, bindings?: any[]): Promise<any>;
    select(sql: string, bindings?: any[]): Promise<any[]>;
    insert(sql: string, bindings?: any[]): Promise<number>;
    update(sql: string, bindings?: any[]): Promise<number>;
    delete(sql: string, bindings?: any[]): Promise<number>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollBack(): Promise<void>;
    private logQuery;
}
//# sourceMappingURL=Connection.d.ts.map