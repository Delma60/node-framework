"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    connection;
    tableName = '';
    selects = ['*'];
    joins = [];
    wheres = [];
    whereBindings = [];
    groupByColumns = [];
    havings = [];
    orderByColumns = [];
    limitValue;
    offsetValue;
    constructor(connection) {
        this.connection = connection;
    }
    // --- Table Selection ---
    table(table) {
        this.tableName = table;
        return this;
    }
    // --- Selects ---
    select(...columns) {
        this.selects = columns.length > 0 ? columns : ['*'];
        return this;
    }
    addSelect(...columns) {
        this.selects = [...this.selects, ...columns];
        return this;
    }
    // --- Joins ---
    join(table, first, operator, second) {
        this.joins.push(`JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }
    leftJoin(table, first, operator, second) {
        this.joins.push(`LEFT JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }
    rightJoin(table, first, operator, second) {
        this.joins.push(`RIGHT JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }
    // --- Basic Wheres ---
    where(column, operatorOrValue, value) {
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
    orWhere(column, operatorOrValue, value) {
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
    whereIn(column, values) {
        if (values.length === 0) {
            this.wheres.push('1 = 0'); // Always false if empty
            return this;
        }
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push(`${column} IN (${placeholders})`);
        this.whereBindings.push(...values);
        return this;
    }
    whereNotIn(column, values) {
        if (values.length === 0) {
            this.wheres.push('1 = 1'); // Always true if empty
            return this;
        }
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push(`${column} NOT IN (${placeholders})`);
        this.whereBindings.push(...values);
        return this;
    }
    whereNull(column) {
        this.wheres.push(`${column} IS NULL`);
        return this;
    }
    whereNotNull(column) {
        this.wheres.push(`${column} IS NOT NULL`);
        return this;
    }
    // --- Grouping & Ordering ---
    groupBy(...columns) {
        this.groupByColumns = [...this.groupByColumns, ...columns];
        return this;
    }
    having(column, operatorOrValue, value) {
        if (value === undefined) {
            value = operatorOrValue;
            operatorOrValue = '=';
        }
        this.havings.push(`${column} ${operatorOrValue} ${typeof value === 'string' ? `'${value}'` : value}`);
        return this;
    }
    orderBy(column, direction = 'asc') {
        this.orderByColumns.push(`${column} ${direction.toUpperCase()}`);
        return this;
    }
    // --- Limit & Offset (Pagination) ---
    limit(value) {
        this.limitValue = value;
        return this;
    }
    take(value) {
        return this.limit(value);
    }
    offset(value) {
        this.offsetValue = value;
        return this;
    }
    skip(value) {
        return this.offset(value);
    }
    // --- Execution (Read) ---
    async get() {
        const sql = this.buildSelectSQL();
        return this.connection.select(sql, this.whereBindings);
    }
    async first() {
        const results = await this.limit(1).get();
        return results.length > 0 ? results[0] : null;
    }
    async find(id, column = 'id') {
        return this.where(column, '=', id).first();
    }
    async pluck(column) {
        const results = await this.select(column).get();
        return results.map(row => row[column]);
    }
    // --- Execution (Aggregates) ---
    async count(column = '*') {
        const result = await this.connection.select(this.buildAggregateSQL(`COUNT(${column})`), this.whereBindings);
        return parseInt(result[0]?.count || 0, 10);
    }
    async max(column) {
        const result = await this.connection.select(this.buildAggregateSQL(`MAX(${column})`), this.whereBindings);
        return result[0]?.max || 0;
    }
    async min(column) {
        const result = await this.connection.select(this.buildAggregateSQL(`MIN(${column})`), this.whereBindings);
        return result[0]?.min || 0;
    }
    async avg(column) {
        const result = await this.connection.select(this.buildAggregateSQL(`AVG(${column})`), this.whereBindings);
        return result[0]?.avg || 0;
    }
    async sum(column) {
        const result = await this.connection.select(this.buildAggregateSQL(`SUM(${column})`), this.whereBindings);
        return result[0]?.sum || 0;
    }
    // --- Execution (Write) ---
    async insert(data) {
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
    async insertGetId(data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        return this.connection.insert(sql, values);
    }
    async update(data) {
        if (this.wheres.length === 0) {
            throw new Error('Cannot update without WHERE clause for safety!');
        }
        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        const whereClause = this.wheres.join(' AND ');
        const sql = `UPDATE ${this.tableName} SET ${updates} WHERE ${whereClause}`;
        return this.connection.update(sql, [...values, ...this.whereBindings]);
    }
    async delete() {
        if (this.wheres.length === 0) {
            throw new Error('Cannot delete without WHERE clause for safety!');
        }
        const whereClause = this.wheres.join(' AND ');
        const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        return this.connection.delete(sql, this.whereBindings);
    }
    // --- Helpers ---
    buildSelectSQL() {
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
    buildAggregateSQL(aggregate) {
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
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=QueryBuilder.js.map