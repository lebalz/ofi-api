import { Pool, QueryResultRow } from 'pg';

const url = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

const db = new Pool({
    connectionString: url,
});

const query = <R extends QueryResultRow = any>(sql: string, values: any[]) => {
    return db.query<R>(sql, values);
};

export { db, query };
