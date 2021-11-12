import { QueryResult } from 'pg';
import { query } from '../db';

export interface User {
    id: number;
    email: string;
    class?: string;
    admin: boolean;
    updated_at: string;
    created_at: string;
}

const extractUser = (result: QueryResult<User>): User | undefined => {
    if (result.rowCount === 1) {
        return result.rows[0];
    }
    return undefined;
};

export const findByMail = (mail: string) => {
    return query<User>('SELECT * FROM users WHERE email = $1', [mail.toLowerCase()]).then(extractUser);
};

export const getOrCreate = (mail: string) => {
    return findByMail(mail).then((user) => {
        if (user) {
            return user;
        }
        return query<User>('INSERT INTO users (email) VALUES ($1) RETURNING *', [mail.toLowerCase()])
            .then((res) => res.rows[0]);
    });
};

export const users = () => {
    return query<User>('SELECT * FROM users', []);
};
