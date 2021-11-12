import { QueryResult } from 'pg';
import { query } from '../db';
import { User } from './user';

export interface DocumentPayload {
    web_key: string;
    data: JSON;
    type: string;
}

export interface Document extends DocumentPayload {
    user_id: number;
    id: number;
    updated_at: string;
    created_at: string;
}

const extractDocument = (result: QueryResult<Document>): Document | undefined => {
    if (result.rowCount === 1) {
        return result.rows[0];
    }
    return undefined;
};
export const find = (userId: string | number, webKey: string) => {
    return query<Document>('SELECT * FROM documents WHERE user_id=$1 and web_key=$2', [userId, webKey]).then(
        extractDocument
    );
};
export const create = (user: User, payload: DocumentPayload) => {
    const { data, web_key, type } = payload;
    return query<Document>(
        'INSERT INTO documents (user_id, web_key, data, type) VALUES ($1,$2,$3,$4) RETURNING *',
        [user.id, web_key, data, type]
    ).then(extractDocument);
};

export const update = (user: User, webKey: string, data: any) => {
    return query<{ updated_at: string }>(
        'UPDATE documents SET data=$1, updated_at=current_timestamp WHERE user_id=$2 and web_key=$3 RETURNING updated_at',
        [data, user.id, webKey]
    ).then((res) => {
        return res.rows[0];
    });
};

export const remove = (user: User, webKey: string) => {
    return query('DELETE FROM documents WHERE user_id=$1 and web_key=$2', [user.id, webKey]);
};
