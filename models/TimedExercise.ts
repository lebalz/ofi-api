import { query } from '../db';
import { first } from './helpers';
import { TimeSpan } from './TimeSpan';
export interface TimedExercisePayload {
    data: JSON;
    name: string;
}

export interface TimedExerciseRecord extends TimedExercisePayload {
    id: number;
    topic_id: number;
    updated_at: string;
    created_at: string;
}

export interface TimedExercise extends TimedExerciseRecord {
    time_spans: TimeSpan[];
}

export const create = (topic_id: number, payload: TimedExercisePayload) => {
    const { data, name } = payload;
    return query<TimedExerciseRecord>(
        `INSERT INTO timed_exercises
            (topic_id, name, data)
        VALUES ($1,$2,$3)
        RETURNING *`,
        [topic_id, name, data]
    ).then(first);
};

export const update = (id: number, data: TimedExercisePayload) => {
    return query<{ updated_at: string }>(
        `UPDATE timed_exercises
        SET data=$1, name=$2, updated_at=current_timestamp
        WHERE id=$3
        RETURNING updated_at`,
        [data.data, data.name, id]
    ).then(first);
};

export const destroy = (id: number) => {
    return query(
        `UPDATE timed_exercises
        SET deleted=true, updated_at=current_timestamp
        WHERE id=$1`,
        [id]
    );
    // return query('DELETE FROM timed_exercises CASCADE WHERE id=$1', [id]);
};
