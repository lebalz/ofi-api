import { QueryResult } from 'pg';
import { query } from '../db';
import { User } from './user';

export interface CommentPayload {
    page_key: string;
    data: Object;
    locator: Object;
    related_to?: number;
}

export interface Comment extends CommentPayload {
    user_id: number;
    id: number;
    updated_at: string;
    created_at: string;
}

const extractComment = (result: QueryResult<Comment>): Comment | undefined => {
    if (result.rowCount === 1) {
        const doc = result.rows[0];
        return doc;
    }
    return undefined;
};

export const findAllByPage = (userId: string | number, pageKey: string) => {
    return query<Comment>('SELECT * FROM comments WHERE user_id=$1 and page_key=$2', [userId, pageKey]).then((res) => {
        return res.rows;
    })
};

export const create = (user: User, payload: CommentPayload) => {
    const { data, locator, page_key, related_to } = payload;
    if ((!locator || Object.keys(locator).length == 0) && !related_to) {
        return Promise.reject('Neither locator nor related_to provided');
    }
    return query<Comment>(
        'INSERT INTO comments (user_id, page_key, data, related_to, locator) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [user.id, page_key, data, related_to, locator]
    ).then(extractComment);
};

export const update = (
    user: User,
    id: string | number,
    data: any,
    locator?: any
) => {
    if (locator) {
        return query<{ updated_at: string }>(
            'UPDATE comments SET data=$1, locator=$4, updated_at=current_timestamp WHERE user_id=$2 and id=$3 RETURNING updated_at', [data, user.id, id, locator]).then((res) => {
            return res.rows[0];
        });
    
    }
    return query<{ updated_at: string }>(
        'UPDATE comments SET data=$1, updated_at=current_timestamp WHERE user_id=$2 and id=$3 RETURNING updated_at', [data, user.id, id]).then((res) => {
        return res.rows[0];
    });
};

export const remove = (user: User, id: number | string) => {
    return query('DELETE FROM comments WHERE user_id=$1 and id=$2', [user.id, id]);
};

export const all = (user: User): Promise<Comment[]> => {
    return query<Comment>('SELECT * FROM comments WHERE user_id=$1', [user.id]).then((res) => {
        return res.rows;
    });
};
