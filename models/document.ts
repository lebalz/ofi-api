import { QueryResult } from 'pg';
import { query } from '../db';
import { User } from './user';

export interface DocumentPayload {
    web_key: string;
    data: Object;
    type: string;
}

export interface Document extends DocumentPayload {
    user_id: number;
    id: number;
    versions: Version[];
    updated_at: string;
    created_at: string;
}

export interface Version {
    version: string; /** ISO Date */
    data: Object;
    pasted: boolean;
}

const extractDocument = (result: QueryResult<Document>): Document | undefined => {
    if (result.rowCount === 1) {
        const doc = result.rows[0];
        doc.versions = [];
        return doc;
    }
    return undefined;
};
const extractDocumentAndVersions = (result: QueryResult<Document>): Document | undefined => {
    if (result.rowCount === 1) {
        return result.rows[0];
    }
    return undefined;
};
export const find = (userId: string | number, webKey: string, includeVersions: boolean = false) => {
    const extractor = includeVersions ? extractDocumentAndVersions : extractDocument;
    return query<Document>('SELECT * FROM documents WHERE user_id=$1 and web_key=$2', [userId, webKey]).then(
        extractor
    );
};
export const create = (user: User, payload: DocumentPayload) => {
    const { data, web_key, type } = payload;
    return query<Document>(
        'INSERT INTO documents (user_id, web_key, data, type) VALUES ($1,$2,$3,$4) RETURNING *',
        [user.id, web_key, data, type]
    ).then(extractDocument);
};

export const update = (
    user: User,
    webKey: string,
    data: any,
    snapshot: boolean = false,
    pasted: boolean = false
) => {
    const insert = [data, user.id, webKey];
    let sql =
        'UPDATE documents SET data=$1, updated_at=current_timestamp WHERE user_id=$2 and web_key=$3 RETURNING updated_at';
    if (snapshot) {
        const version: Version = { version: new Date().toISOString(), data: data, pasted: pasted };
        insert.push(version);
        sql =
            'UPDATE documents SET data=$1, updated_at=current_timestamp, versions=array_append(versions, $4) WHERE user_id=$2 and web_key=$3 RETURNING updated_at';
    }
    return query<{ updated_at: string }>(sql, insert).then((res) => {
        return res.rows[0];
    });
};

export const remove = (user: User, webKey: string) => {
    return query('DELETE FROM documents WHERE user_id=$1 and web_key=$2', [user.id, webKey]);
};
