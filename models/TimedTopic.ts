import { QueryResult } from 'pg';
import { query } from '../db';
import { TimedExercise } from './TimedExercise';
import { User } from './user';

export interface TimedTopicPayload {
    web_key: string;
    data: JSON;
}

export interface TimedTopicRecord extends TimedTopicPayload {
    id: number;
    user_id: number;
    updated_at: string;
    created_at: string;
}

export interface TimedTopic extends TimedTopicRecord {
    exercises: TimedExercise[];
}

const extractAggTopic = (result: QueryResult<{topic: TimedTopicRecord[]}>): TimedTopicRecord | undefined => {
    if (result.rowCount === 1 && result.rows[0].topic && result.rows[0].topic[0]) {
            return result.rows[0].topic[0];
        }
        return undefined;
    };
const extractTopic = (result: QueryResult<TimedTopicRecord>): TimedTopicRecord | undefined => {
    if (result.rowCount === 1) {
            return result.rows[0];
        }
        return undefined;
    };

export const find = (user_id: string | number, webKey: string) => {
    return query<{topic: TimedTopic[]}>(
        `SELECT
        json_agg(json_build_object(
                'id', tt.id,
                'user_id', tt.user_id,
                'web_key', tt.web_key,
                'data', tt.data,
                'updated_at', tt.updated_at,
                'created_at', tt.created_at,
                'exercises', coalesce(exercises, '[]'::JSON)
            )) topic
        FROM timed_topics tt
        LEFT JOIN (
            SELECT topic_id,
                json_agg(
                    json_build_object(
                        'id', te.id,
                        'data', te.data,
                        'name', te.name,
                        'updated_at', te.updated_at,
                        'created_at', te.created_at,
                        'time_spans', coalesce(spans, '[]'::JSON)
                    )
                ) exercises
            FROM timed_exercises te
            LEFT JOIN (
                SELECT exercise_id,
                    json_agg(
                        json_build_object(
                            'id', ts.id,
                            'start', ts.start,
                            'stop', ts.stop
                        )
                    ) spans
                FROM time_spans ts
                GROUP BY 1
            ) ts ON te.id = ts.exercise_id
            WHERE NOT te.deleted
            GROUP BY topic_id
        ) teAGG ON tt.id = teAGG.topic_id
        WHERE tt.user_id=$1 and tt.web_key=$2
        GROUP BY tt.id
        `,
        [user_id, webKey]
    ).then((res) => {
        return extractAggTopic(res);
    });
};

export const create = (user: User, payload: TimedTopicPayload) => {
    const { data, web_key } = payload;
    return query<TimedTopicRecord>(
        'INSERT INTO timed_topics (user_id, web_key, data) VALUES ($1,$2,$3) RETURNING *',
        [user.id, web_key, data]
    ).then(extractTopic);
};

export const update = (user: User, webKey: string, data: any) => {
    return query<{ updated_at: string }>(
        'UPDATE timed_topics SET data=$1, updated_at=current_timestamp WHERE user_id=$2 and web_key=$3 RETURNING updated_at',
        [data, user.id, webKey]
    ).then((res) => {
        return res.rows[0];
    });
};
