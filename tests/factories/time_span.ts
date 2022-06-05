import { query } from '../../db';
import { TimeSpan, create as createSpan } from '../../models/TimeSpan';
import { TimedExercise, create as createExercise } from '../../models/TimedExercise';
import { TimedTopic, create as createTopic } from '../../models/TimedTopic';
import { User } from '../../models/user';
import { sequence } from '../helpers/sequence';

const topicSeq = sequence();

const baseTopic: () => TimedTopic = () => ({
    id: topicSeq(),  /* make sure postgres' sequence (serial id) is not using this id */
    user_id: 1,
    web_key: '015144b5-a9fd-405b-acaf-db55540357d9',
    created_at: '2022-01-02',
    updated_at: '2022-01-04',
    exercises: [],
    data: {}
});

export const topicProps = (props?: Partial<TimedTopic>) => {
    return { ...baseTopic(), ...props };
};

const exerciseSeq = sequence();
const baseExercise: (tid: number) => TimedExercise = (tid: number) => ({
    id: exerciseSeq(),
    created_at: '2022-01-02',
    updated_at: '2022-01-02',
    data: {
        labels: []
    },
    name: '143b',
    time_spans: [],
    topic_id: tid
});

export const exerciseProps = (props?: {topic_id: number} & Partial<TimedExercise>) => {
    return { ...baseExercise(props.topic_id), ...props };
};


const spanSeq = sequence();
const baseTimeSpan: (eid: number) => TimeSpan = (eid: number) => ({
    id: spanSeq(),
    exercise_id: eid,
    start: '2021-11-12T08:13:00.000Z',
    stop: '2021-11-12T08:17:00.000Z',
});

export const timeSpanProps = (props?: {exercise_id: number} & Partial<TimeSpan>) => {
    return { ...baseTimeSpan(props.exercise_id), ...props };
};

export const create = async (props?: Partial<TimedTopic>) => {
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
