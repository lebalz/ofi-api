import { first } from './helpers';
import { QueryResult } from 'pg';
import { query } from '../db';

export interface UserProps {
    class?: string;
    groups: string[];
}

export interface User extends UserProps {
    id: number;
    email: string;
    admin: boolean;
    updated_at: string;
    created_at: string;
}

const extractUser = (result: QueryResult<User>): User | undefined => {
    if (result.rowCount === 1) {
        return result.rows[0];
    }
    return undefined;
};

export const findByMail = (mail: string) => {
    return query<User>('SELECT * FROM users WHERE email = $1', [mail.toLowerCase()]).then(extractUser);
};

export const getOrCreate = (mail: string) => {
    return findByMail(mail).then((user) => {
        if (user) {
            return user;
        }
        return query<User>('INSERT INTO users (email) VALUES ($1) RETURNING *', [mail.toLowerCase()]).then(
            (res) => res.rows[0]
        );
    });
};

export const users = () => {
    return query<User>('SELECT * FROM users', []);
};

export const find = (id: number | string) => {
    return query<User>('SELECT * FROM users WHERE id = $1', [id]).then(extractUser);
};

export const update = (id: number | string, props: UserProps) => {
    return query<User>('UPDATE users SET class=$2, groups=$3 WHERE id = $1 RETURNING *', [
        id,
        props.class,
        props.groups,
    ]).then(extractUser);
};

export const ownsTimedTopic = (user: User, id: number) => {
    return query<{ isOwner: boolean }>(
        `
        SELECT true FROM timed_topics
        WHERE timed_topics.user_id=$1 AND timed_topics.id=$2`,
        [user.id, id]
    ).then(first);
};

export const ownsTimedExercise = (user: User, exercise_id: number) => {
    return query<{ permission: boolean }>(
        `
        SELECT true as permission FROM timed_topics
        INNER JOIN timed_exercises ON timed_topics.id=timed_exercises.topic_id
        WHERE timed_topics.user_id=$1 AND timed_exercises.id=$2`,
        [user.id, exercise_id]
    ).then(first);
};

export const ownsTimeSpan = (user: User, timespan_id: number) => {
    return query<{ isOwner: boolean }>(
        `
        SELECT true FROM timed_topics
        INNER JOIN timed_exercises ON timed_topics.id=timed_exercises.topic_id
        INNER JOIN time_spans ON timed_exercises.id=time_spans.exercise_id
        WHERE timed_topics.user_id=$1 AND time_spans.id=$2`,
        [user.id, timespan_id]
    ).then(first);
};
