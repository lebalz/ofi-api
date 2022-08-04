import { query } from '../../db';

export const truncate = () => {
    const deletions = [
        'comments',
        'documents',
        'solution_policies',
        'time_spans',
        'timed_topics',
        'timed_exercises',
        'users',
    ].reduce((prom, table) => {
        return prom.then(() => {
            return query(`DELETE from ${table};`, []);
        });
    }, query('SELECT 1;', []));
    return deletions;
};
