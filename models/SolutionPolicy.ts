import { User } from './user';
import { QueryResult } from 'pg';
import { query } from '../db';
import { intersection } from 'lodash';

export interface SolutionPolicyPayload {
    web_key: string;
    document_url: string;
}

export interface SolutionPolicy extends SolutionPolicyPayload {
    authorized_classes: string[];
    authorized_users: string[];
    authorized_groups: string[];
    created_at: string;
    updated_at: string;
}

export interface DisplayAuthorization {
    show: boolean;
    web_key: string;
    user_id: number;
}

type PolicyColumns = 'class' | 'group' | 'user';

const POLICY_MAP: { [key in PolicyColumns]: keyof SolutionPolicy } = {
    class: 'authorized_classes',
    group: 'authorized_groups',
    user: 'authorized_users',
};
export interface PolicyModifier {
    action: 'add' | 'remove';
    auth_type: PolicyColumns;
    values: string[];
}

const extractPolicy = (result: QueryResult<SolutionPolicy>): SolutionPolicy | undefined => {
    if (result.rowCount === 1) {
        return result.rows[0];
    }
    throw new Error('No Policy found');
};

export const find = (webKey: string): Promise<SolutionPolicy | undefined> => {
    return query<SolutionPolicy>('SELECT * FROM solution_policies WHERE web_key=$1', [webKey]).then(
        extractPolicy
    );
};

export const all = (): Promise<SolutionPolicy[]> => {
    return query<SolutionPolicy>('SELECT * FROM solution_policies', []).then((res) => {
        return res.rows;
    });
};

export const authorized = (user: User, webKey: string): Promise<DisplayAuthorization> => {
    return find(webKey).then((policy) => {
        if (user.admin) {
            return Promise.resolve({ show: true, web_key: webKey, user_id: user.id });
        }
        if (policy) {
            if (user.class && policy.authorized_classes.includes(user.class)) {
                return { show: true, web_key: webKey, user_id: user.id };
            }
            if (intersection(policy.authorized_groups, user.groups).length > 0) {
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

export const update = (webKey: string, payload: PolicyModifier): Promise<SolutionPolicy | undefined> => {
    return find(webKey).then((policy) => {
        if (policy) {
            const col = POLICY_MAP[payload.auth_type];
            if (!col) {
                throw new Error('Invalid auth_type');
            }
            const current = new Set(policy[col]);
            switch (payload.action) {
                case 'add':
                    payload.values.forEach((rm) => {
                        current.add(rm);
                    });
                    break;
                case 'remove':
                    payload.values.forEach((rm) => {
                        current.delete(rm);
                    });
                    break;
            }
            return query<SolutionPolicy>(
                `UPDATE solution_policies SET ${col}=$1 WHERE web_key=$2 RETURNING *`,
                [[...current], policy.web_key]
            ).then(extractPolicy);
        }
    });
};
