import { Connection } from './Connections/Connection';
import { IQueryBuilder } from './IQueryBuilder';

type WhereClause = {
    type: 'Basic' | 'Nested' | 'In' | 'NotIn' | 'Null' | 'NotNull';
    boolean: 'AND' | 'OR';
    sql?: string;         // Used for basic and raw queries
    query?: QueryBuilder; // Used for nested closures
};

export class QueryBuilder implements IQueryBuilder {
    protected connection: Connection;
    protected tableName: string = '';
    
    protected selects: string[] = ['*'];
    protected joins: string[] = [];
    protected wheres: WhereClause[] = [];
    protected bindings: { where: any[] } = { where: [] };
    protected groupByColumns: string[] = [];
    protected havings: string[] = [];
    protected orderByColumns: string[] = [];
    protected limitValue?: number;
    protected offsetValue?: number;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    // --- Table Selection ---

    public table(table: string): this {
        this.tableName = table;
        return this;
    }

    // --- Selects ---

    public select(...columns: string[]): this {
        this.selects = columns.length > 0 ? columns : ['*'];
        return this;
    }

    public addSelect(...columns: string[]): this {
        this.selects = [...this.selects, ...columns];
        return this;
    }

    // --- Joins ---

    public join(table: string, first: string, operator: string, second: string): this {
        this.joins.push(`JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }

    public leftJoin(table: string, first: string, operator: string, second: string): this {
        this.joins.push(`LEFT JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }

    public rightJoin(table: string, first: string, operator: string, second: string): this {
        this.joins.push(`RIGHT JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }

    // --- Basic Wheres ---

    public where(column: string | ((query: QueryBuilder) => void), operatorOrValue?: any, value?: any, boolean: 'AND' | 'OR' = 'AND'): this {
        // Handle nested closure: where(q => q.where('a', 1).orWhere('b', 2))
        if (typeof column === 'function') {
            const nestedQuery = new QueryBuilder(this.connection);
            column(nestedQuery);
            
            this.wheres.push({ type: 'Nested', boolean, query: nestedQuery });
            this.bindings.where.push(...nestedQuery.getBindings());
            return this;
        }

        if (value === undefined) {
            value = operatorOrValue;
            operatorOrValue = '=';
        }
        
        this.wheres.push({ type: 'Basic', boolean, sql: `${column} ${operatorOrValue} ?` });
        this.bindings.where.push(value);
        return this;
    }

    public orWhere(column: string | ((query: QueryBuilder) => void), operatorOrValue?: any, value?: any): this {
        return this.where(column, operatorOrValue, value, 'OR');
    }

    public getBindings(): any[] {
        return this.bindings.where;
    }

    // --- Advanced Wheres ---

    public whereIn(column: string, values: any[]): this {
        if (values.length === 0) {
            this.wheres.push({ type: 'In', boolean: 'AND', sql: '1 = 0' });
            return this;
        }
        
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push({ type: 'In', boolean: 'AND', sql: `${column} IN (${placeholders})` });
        this.bindings.where.push(...values);
        return this;
    }

    public whereNotIn(column: string, values: any[]): this {
        if (values.length === 0) {
            this.wheres.push({ type: 'NotIn', boolean: 'AND', sql: '1 = 1' });
            return this;
        }
        
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push({ type: 'NotIn', boolean: 'AND', sql: `${column} NOT IN (${placeholders})` });
        this.bindings.where.push(...values);
        return this;
    }

    public whereNull(column: string): this {
        this.wheres.push({ type: 'Null', boolean: 'AND', sql: `${column} IS NULL` });
        return this;
    }

    public whereNotNull(column: string): this {
        this.wheres.push({ type: 'NotNull', boolean: 'AND', sql: `${column} IS NOT NULL` });
        return this;
    }

    // --- Grouping & Ordering ---

    public groupBy(...columns: string[]): this {
        this.groupByColumns = [...this.groupByColumns, ...columns];
        return this;
    }

    public having(column: string, operatorOrValue: any, value?: any): this {
        if (value === undefined) {
            value = operatorOrValue;
            operatorOrValue = '=';
        }
        
        this.havings.push(`${column} ${operatorOrValue} ${typeof value === 'string' ? `'${value}'` : value}`);
        return this;
    }

    public orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
        this.orderByColumns.push(`${column} ${direction.toUpperCase()}`);
        return this;
    }

    // --- Limit & Offset (Pagination) ---

    public limit(value: number): this {
        this.limitValue = value;
        return this;
    }

    public take(value: number): this {
        return this.limit(value);
    }

    public offset(value: number): this {
        this.offsetValue = value;
        return this;
    }

    public skip(value: number): this {
        return this.offset(value);
    }

    // --- Execution (Read) ---

    public async get<T = any>(): Promise<T[]> {
        const sql = this.buildSelectSQL();
        return this.connection.select(sql, this.bindings.where);
    }

    public async first<T = any>(): Promise<T | null> {
        const results = await this.limit(1).get<T>();
        return results.length > 0 ? results[0]! : null;
    }

    public async find<T = any>(id: number | string, column: string = 'id'): Promise<T | null> {
        return this.where(column, '=', id).first<T>();
    }

    public async pluck<T = any>(column: string): Promise<T[]> {
        const results = await this.select(column).get<any>();
        return results.map(row => row[column]);
    }

    // --- Execution (Aggregates) ---

    public async count(column: string = '*'): Promise<number> {
        return this.aggregate('COUNT', column);
    }

    public async max(column: string): Promise<number> {
        return this.aggregate('MAX', column);
    }

    public async min(column: string): Promise<number> {
        return this.aggregate('MIN', column);
    }

    public async avg(column: string): Promise<number> {
        return this.aggregate('AVG', column);
    }

    public async sum(column: string): Promise<number> {
        return this.aggregate('SUM', column);
    }

    protected async aggregate(fn: string, column: string): Promise<number> {
        // Alias the result as "aggregate" so we can easily access it across all databases
        const selectSql = `${fn}(${column}) AS aggregate`;
        let sql = `SELECT ${selectSql} FROM ${this.tableName}`;

        if (this.joins.length > 0) {
            sql += ` ${this.joins.join(' ')}`;
        }

        if (this.wheres.length > 0) {
            sql += ` WHERE ${this.compileWheres(this.wheres)}`;
        }

        const result = await this.connection.select(sql, this.bindings.where);
        return parseFloat(result[0]?.aggregate || 0);
    }

    // --- Execution (Write) ---

    public async insert(data: Record<string, any> | Record<string, any>[]): Promise<boolean> {
        // Handle both single and bulk inserts
        const rows = Array.isArray(data) ? data : [data];
        
        for (const row of rows) {
            const columns = Object.keys(row);
            const values = Object.values(row);
            const placeholders = columns.map(() => '?').join(', ');
            
            const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            await this.connection.insert(sql, values);
        }
        
        return true;
    }

    public async insertGetId(data: Record<string, any>): Promise<number> {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        return this.connection.insert(sql, values);
    }

    public async update(data: Record<string, any>): Promise<number> {
        if (this.wheres.length === 0) {
            throw new Error('Cannot update without WHERE clause for safety!');
        }

        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        const whereClause = this.compileWheres(this.wheres);
        
        const sql = `UPDATE ${this.tableName} SET ${updates} WHERE ${whereClause}`;
        return this.connection.update(sql, [...values, ...this.bindings.where]);
    }

    public async delete(): Promise<number> {
        if (this.wheres.length === 0) {
            throw new Error('Cannot delete without WHERE clause for safety!');
        }

        const whereClause = this.compileWheres(this.wheres);
        const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        return this.connection.delete(sql, this.bindings.where);
    }

    // --- Helpers ---

    protected compileWheres(wheres: WhereClause[]): string {
        if (wheres.length === 0) return '';

        const sql = wheres.map((where, index) => {
            const booleanPrefix = index === 0 ? '' : `${where.boolean} `;

            if (where.type === 'Nested' && where.query) {
                const nestedSql = this.compileWheres(where.query.wheres);
                return `${booleanPrefix}(${nestedSql})`;
            }

            return `${booleanPrefix}${where.sql}`;
        }).join(' ');

        return sql;
    }

    protected buildSelectSQL(): string {
        let sql = `SELECT ${this.selects.join(', ')} FROM ${this.tableName}`;

        if (this.joins.length > 0) {
            sql += ` ${this.joins.join(' ')}`;
        }

        if (this.wheres.length > 0) {
            sql += ` WHERE ${this.compileWheres(this.wheres)}`;
        }

        if (this.groupByColumns.length > 0) {
            sql += ` GROUP BY ${this.groupByColumns.join(', ')}`;
        }

        if (this.havings.length > 0) {
            sql += ` HAVING ${this.havings.join(' AND ')}`;
        }

        if (this.orderByColumns.length > 0) {
            sql += ` ORDER BY ${this.orderByColumns.join(', ')}`;
        }

        if (this.limitValue !== undefined) {
            sql += ` LIMIT ${this.limitValue}`;
        }

        if (this.offsetValue !== undefined) {
            sql += ` OFFSET ${this.offsetValue}`;
        }

        return sql;
    }
}
