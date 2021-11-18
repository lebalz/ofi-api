import { query } from '../db';
import { first } from './helpers';

export interface TimeSpan {
    id: number;
    exercise_id: number;
    start: string;
    end: string;
}

export const create = (exercise_id: number) => {
    return query<TimeSpan>(
        'INSERT INTO time_spans (exercise_id, start) VALUES ($1,current_timestamp) RETURNING *',
        [exercise_id]
    ).then(first);
};

export const stop = (exercise_id: number) => {
    return query<TimeSpan>('UPDATE time_spans SET stop=current_timestamp WHERE id=$1 RETURNING *', [
        exercise_id,
    ]).then(first);
};
