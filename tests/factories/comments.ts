import { query } from '../../db';
import { Comment, remove, create as createDoc } from '../../models/comment';
import { User } from '../../models/user';
import { sequence } from '../helpers/sequence';

const commentSequence = sequence();

const base: () => Partial<Comment> = () => ({
    id: commentSequence() /* make sure postgres' sequence (serial id) is not using this id */,
    user_id: 1,
    page_key: '7899b506-4d06-4845-9f77-8015baaa256f',
    created_at: '2022-01-02',
    updated_at: '2022-01-04',
});
const comment: () => Comment = () => ({
    ...(base() as Comment),
    locator: { type: 'paragraph', nr: 1},
    data: { comment: '<b></b>' },
});

export const commentProps = (props?: Partial<Comment>) => {
    return { ...comment(), ...props };
};

export const create = async (props?: Partial<Comment>) => {
    const com = commentProps(props);

    return remove({ id: com.user_id } as User, com.id).then(() => {
        return query<Comment>(
            `INSERT INTO comments (id, user_id, page_key, locator, data, related_to, updated_at, created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [
                com.id,
                com.user_id,
                com.page_key,
                com.locator,
                com.data,
                com.related_to,
                com.updated_at,
                com.created_at
            ]
        );
    });
};
