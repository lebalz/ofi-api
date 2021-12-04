import { User } from './user';
import { first } from './helpers';
import { QueryResult } from 'pg';
import { query } from '../db';

export interface SolutionPolicyPayload {
    web_key: string;
    document_url: string;
}

export interface SolutionPolicy extends SolutionPolicyPayload {
    authorized_classes: string[];
    authorized_users: string[];
    created_at: string;
    updated_at: string;
}

export interface DisplayAuthorization {
    show: boolean;
    web_key: string;
    user_id: number;
}

const extractPolicy = (result: QueryResult<SolutionPolicy>): SolutionPolicy | undefined => {
    if (result.rowCount === 1) {
        return result.rows[0];
    }
    throw new Error('No Policy found');
};

export const authorized = (user: User, webKey: string): Promise<DisplayAuthorization> => {
    return query<SolutionPolicy>('SELECT * FROM solution_policies WHERE web_key=$1', [webKey])
        .then(extractPolicy)
        .then((policy) => {
            if (user.admin) {
                return Promise.resolve({ show: true, web_key: webKey, user_id: user.id });
            }
            if (policy) {
                if (user.class && policy.authorized_classes.includes(user.class)) {
                    return { show: true, web_key: webKey, user_id: user.id };
                }
                if (policy.authorized_users.includes(user.email)) {
                    return { show: true, web_key: webKey, user_id: user.id };
                }
            }
            return { show: false, web_key: webKey, user_id: user.id };
        });
};

export const create = (payload: SolutionPolicyPayload) => {
    const { web_key, document_url } = payload;
    return query<SolutionPolicy>(
        'INSERT INTO solution_policies (web_key, document_url) VALUES ($1,$2) RETURNING *',
        [web_key, document_url]
    ).then(extractPolicy);
};
