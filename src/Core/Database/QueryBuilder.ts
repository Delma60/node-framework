import { Connection } from './Connections/Connection';
import { IQueryBuilder } from './IQueryBuilder';

export class QueryBuilder implements IQueryBuilder {
    protected connection: Connection;
    protected tableName: string = '';
    
    protected selects: string[] = ['*'];
    protected joins: string[] = [];
    protected wheres: string[] = [];
    protected whereBindings: any[] = [];
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

    public where(column: string, operatorOrValue: any, value?: any): this {
        // If 3 arguments: where('id', '=', 5)
        // If 2 arguments: where('id', 5) - defaults to '='
        if (value === undefined) {
            value = operatorOrValue;
            operatorOrValue = '=';
        }
        
        this.wheres.push(`${column} ${operatorOrValue} ?`);
        this.whereBindings.push(value);
        return this;
    }

    public orWhere(column: string, operatorOrValue: any, value?: any): this {
        // If 3 arguments: orWhere('id', '=', 5)
        // If 2 arguments: orWhere('id', 5) - defaults to '='
        if (value === undefined) {
            value = operatorOrValue;
            operatorOrValue = '=';
        }
        
        this.wheres.push(`OR ${column} ${operatorOrValue} ?`);
        this.whereBindings.push(value);
        return this;
    }

    // --- Advanced Wheres ---

    public whereIn(column: string, values: any[]): this {
        if (values.length === 0) {
            this.wheres.push('1 = 0'); // Always false if empty
            return this;
        }
        
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push(`${column} IN (${placeholders})`);
        this.whereBindings.push(...values);
        return this;
    }

    public whereNotIn(column: string, values: any[]): this {
        if (values.length === 0) {
            this.wheres.push('1 = 1'); // Always true if empty
            return this;
        }
        
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push(`${column} NOT IN (${placeholders})`);
        this.whereBindings.push(...values);
        return this;
    }

    public whereNull(column: string): this {
        this.wheres.push(`${column} IS NULL`);
        return this;
    }

    public whereNotNull(column: string): this {
        this.wheres.push(`${column} IS NOT NULL`);
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
        return this.connection.select(sql, this.whereBindings);
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
        const result = await this.connection.select(
            this.buildAggregateSQL(`COUNT(${column})`),
            this.whereBindings
        );
        return parseInt(result[0]?.count || 0, 10);
    }

    public async max(column: string): Promise<number> {
        const result = await this.connection.select(
            this.buildAggregateSQL(`MAX(${column})`),
            this.whereBindings
        );
        return result[0]?.max || 0;
    }

    public async min(column: string): Promise<number> {
        const result = await this.connection.select(
            this.buildAggregateSQL(`MIN(${column})`),
            this.whereBindings
        );
        return result[0]?.min || 0;
    }

    public async avg(column: string): Promise<number> {
        const result = await this.connection.select(
            this.buildAggregateSQL(`AVG(${column})`),
            this.whereBindings
        );
        return result[0]?.avg || 0;
    }

    public async sum(column: string): Promise<number> {
        const result = await this.connection.select(
            this.buildAggregateSQL(`SUM(${column})`),
            this.whereBindings
        );
        return result[0]?.sum || 0;
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
        const whereClause = this.wheres.join(' AND ');
        
        const sql = `UPDATE ${this.tableName} SET ${updates} WHERE ${whereClause}`;
        return this.connection.update(sql, [...values, ...this.whereBindings]);
    }

    public async delete(): Promise<number> {
        if (this.wheres.length === 0) {
            throw new Error('Cannot delete without WHERE clause for safety!');
        }

        const whereClause = this.wheres.join(' AND ');
        const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        return this.connection.delete(sql, this.whereBindings);
    }

    // --- Helpers ---

    protected buildSelectSQL(): string {
        let sql = `SELECT ${this.selects.join(', ')} FROM ${this.tableName}`;

        if (this.joins.length > 0) {
            sql += ` ${this.joins.join(' ')}`;
        }

        if (this.wheres.length > 0) {
            sql += ` WHERE ${this.wheres.join(' AND ')}`;
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

    protected buildAggregateSQL(aggregate: string): string {
        let sql = `SELECT ${aggregate} FROM ${this.tableName}`;

        if (this.joins.length > 0) {
            sql += ` ${this.joins.join(' ')}`;
        }

        if (this.wheres.length > 0) {
            sql += ` WHERE ${this.wheres.join(' AND ')}`;
        }

        return sql;
    }
}
