import { Pool, QueryResultRow } from 'pg';

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const query = <R extends QueryResultRow = any>(sql: string, values: any[]) => {
    return db.query<R>(sql, values);
};

export { db, query };
