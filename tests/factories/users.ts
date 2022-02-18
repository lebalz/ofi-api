import { query } from '../../db';
import { User, getOrCreate as getOrCreateUser } from '../../models/user';

const foo: User = {
    id: 10000, /* make sure postgres' sequence (serial id) is not using this id */
    admin: false,
    email: 'foo@bar.ch',
    groups: [],
    class: '69x',
    created_at: '2021-11-11',
    updated_at: '2021-11-12',
};

const admin: User = {
    id: 10001, /* make sure postgres' sequence (serial id) is not using this id */
    admin: false,
    email: 'admin@bar.ch',
    groups: [],
    class: undefined,
    created_at: '2021-11-11',
    updated_at: '2021-11-12',
};

export const userProps = (props?: Partial<User>) => {
    if (props?.admin) {
        return { ...admin, ...props };
    }
    return { ...foo, ...props };
};

export const getOrCreate = async (props?: Partial<User>) => {
    const user = userProps(props);
    return query('DELETE FROM users WHERE id=$1', [user.id]).then(() => {
        return query(
            `INSERT INTO users (id, email, admin, updated_at, created_at, class, groups)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [user.id, user.email, user.admin, user.updated_at, user.created_at, user.class, user.groups]
        );
    });
};
