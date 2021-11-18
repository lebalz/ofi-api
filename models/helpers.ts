import { QueryResult } from 'pg';
export const first = <T>(result: QueryResult<T>): T | undefined => {
    if (result.rowCount > 0) {
        return result.rows[0];
    }
    return undefined;
};

export interface UpdateResponse {
    updated_at: string;
}