export interface IQueryBuilder {
    // --- Table Selection ---
    table(table: string): this;

    // --- Selects ---
    select(...columns: string[]): this;
    addSelect(...columns: string[]): this;

    // --- Joins ---
    join(table: string, first: string, operator: string, second: string): this;
    leftJoin(table: string, first: string, operator: string, second: string): this;
    rightJoin(table: string, first: string, operator: string, second: string): this;

    // --- Basic Wheres (supports closures for nested conditions) ---
    where(column: string | ((query: IQueryBuilder) => void), operatorOrValue?: any, value?: any): this;
    orWhere(column: string | ((query: IQueryBuilder) => void), operatorOrValue?: any, value?: any): this;
    
    // --- Advanced Wheres ---
    whereIn(column: string, values: any[]): this;
    whereNotIn(column: string, values: any[]): this;
    whereNull(column: string): this;
    whereNotNull(column: string): this;

    // --- Grouping & Ordering ---
    groupBy(...columns: string[]): this;
    having(column: string, operatorOrValue: any, value?: any): this;
    orderBy(column: string, direction?: 'asc' | 'desc'): this;

    // --- Limit & Offset (Pagination) ---
    limit(value: number): this;
    take(value: number): this;   // Alias for limit()
    offset(value: number): this;
    skip(value: number): this;   // Alias for offset()

    // --- Execution (Read) ---
    get<T = any>(): Promise<T[]>;
    first<T = any>(): Promise<T | null>;
    find<T = any>(id: number | string, column?: string): Promise<T | null>;
    pluck<T = any>(column: string): Promise<T[]>;

    // --- Execution (Aggregates) ---
    count(column?: string): Promise<number>;
    max(column: string): Promise<number>;
    min(column: string): Promise<number>;
    avg(column: string): Promise<number>;
    sum(column: string): Promise<number>;

    // --- Execution (Write) ---
    insert(data: Record<string, any> | Record<string, any>[]): Promise<boolean>;
    insertGetId(data: Record<string, any>): Promise<number>; // Returns auto-increment ID
    update(data: Record<string, any>): Promise<number>;      // Returns affected rows
    delete(): Promise<number>;                               // Returns affected rows
}
