export interface IQueryBuilder {
    table(table: string): this;
    select(...columns: string[]): this;
    addSelect(...columns: string[]): this;
    join(table: string, first: string, operator: string, second: string): this;
    leftJoin(table: string, first: string, operator: string, second: string): this;
    rightJoin(table: string, first: string, operator: string, second: string): this;
    where(column: string, operatorOrValue: any, value?: any): this;
    orWhere(column: string, operatorOrValue: any, value?: any): this;
    whereIn(column: string, values: any[]): this;
    whereNotIn(column: string, values: any[]): this;
    whereNull(column: string): this;
    whereNotNull(column: string): this;
    groupBy(...columns: string[]): this;
    having(column: string, operatorOrValue: any, value?: any): this;
    orderBy(column: string, direction?: 'asc' | 'desc'): this;
    limit(value: number): this;
    take(value: number): this;
    offset(value: number): this;
    skip(value: number): this;
    get<T = any>(): Promise<T[]>;
    first<T = any>(): Promise<T | null>;
    find<T = any>(id: number | string, column?: string): Promise<T | null>;
    pluck<T = any>(column: string): Promise<T[]>;
    count(column?: string): Promise<number>;
    max(column: string): Promise<number>;
    min(column: string): Promise<number>;
    avg(column: string): Promise<number>;
    sum(column: string): Promise<number>;
    insert(data: Record<string, any> | Record<string, any>[]): Promise<boolean>;
    insertGetId(data: Record<string, any>): Promise<number>;
    update(data: Record<string, any>): Promise<number>;
    delete(): Promise<number>;
}
//# sourceMappingURL=IQueryBuilder.d.ts.map