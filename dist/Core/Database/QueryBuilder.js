"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    connection;
    tableName = '';
    selects = ['*'];
    joins = [];
    wheres = [];
    bindings = { where: [] };
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
    where(column, operatorOrValue, value, boolean = 'AND') {
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
    orWhere(column, operatorOrValue, value) {
        return this.where(column, operatorOrValue, value, 'OR');
    }
    getBindings() {
        return this.bindings.where;
    }
    // --- Advanced Wheres ---
    whereIn(column, values) {
        if (values.length === 0) {
            this.wheres.push({ type: 'In', boolean: 'AND', sql: '1 = 0' });
            return this;
        }
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push({ type: 'In', boolean: 'AND', sql: `${column} IN (${placeholders})` });
        this.bindings.where.push(...values);
        return this;
    }
    whereNotIn(column, values) {
        if (values.length === 0) {
            this.wheres.push({ type: 'NotIn', boolean: 'AND', sql: '1 = 1' });
            return this;
        }
        const placeholders = values.map(() => '?').join(', ');
        this.wheres.push({ type: 'NotIn', boolean: 'AND', sql: `${column} NOT IN (${placeholders})` });
        this.bindings.where.push(...values);
        return this;
    }
    whereNull(column) {
        this.wheres.push({ type: 'Null', boolean: 'AND', sql: `${column} IS NULL` });
        return this;
    }
    whereNotNull(column) {
        this.wheres.push({ type: 'NotNull', boolean: 'AND', sql: `${column} IS NOT NULL` });
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
        return this.connection.select(sql, this.bindings.where);
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
        return this.aggregate('COUNT', column);
    }
    async max(column) {
        return this.aggregate('MAX', column);
    }
    async min(column) {
        return this.aggregate('MIN', column);
    }
    async avg(column) {
        return this.aggregate('AVG', column);
    }
    async sum(column) {
        return this.aggregate('SUM', column);
    }
    async aggregate(fn, column) {
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
        const whereClause = this.compileWheres(this.wheres);
        const sql = `UPDATE ${this.tableName} SET ${updates} WHERE ${whereClause}`;
        return this.connection.update(sql, [...values, ...this.bindings.where]);
    }
    async delete() {
        if (this.wheres.length === 0) {
            throw new Error('Cannot delete without WHERE clause for safety!');
        }
        const whereClause = this.compileWheres(this.wheres);
        const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        return this.connection.delete(sql, this.bindings.where);
    }
    // --- Helpers ---
    compileWheres(wheres) {
        if (wheres.length === 0)
            return '';
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
    buildSelectSQL() {
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
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=QueryBuilder.js.map