import { query } from '../../db';
import { Document, remove, create as createDoc } from '../../models/document';
import { User } from '../../models/user';

const base: Partial<Document> = {
    id: 1,
    user_id: 1,
    web_key: '003258dd-3641-44f1-812f-2d4febd9c096',
    versions: [],
    created_at: '2022-01-02',
    updated_at: '2022-01-04',
};
const text: Document = {
    ...(base as Document),
    type: 'text',
    data: { type: 'text', value: '<b></b>' },
};

export const docProps = (props?: Partial<Document>) => {
    return { ...text, ...props };
};

export const create = async (props?: Partial<Document>) => {
    const doc = docProps(props);

    return remove({ id: doc.user_id } as User, doc.web_key).then(() => {
        return query<Document>(
            `INSERT INTO documents (id, user_id, web_key, data, type, versions, updated_at, created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [
                doc.id,
                doc.user_id,
                doc.web_key,
                doc.data,
                doc.type,
                doc.versions,
                doc.updated_at,
                doc.created_at,
            ]
        );
    });
};
