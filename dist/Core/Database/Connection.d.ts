import { Connection as BaseConnection } from './Connections/Connection';
export declare class Connection extends BaseConnection {
    private pool;
    protected inTransaction: boolean;
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
    getDriverName(): string;
    getRawConnection(): any;
    protected logQuery(sql: string, bindings: any[]): void;
}
//# sourceMappingURL=Connection.d.ts.map