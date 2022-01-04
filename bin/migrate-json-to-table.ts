import { Pool } from 'pg';
const fs = require('fs');

throw new Error('shall not be run einfach so...');

/**
 * run with
 * DATABASE_URL="postgresql://ofi_api:pw@localhost:5432/ofi_api" npx ts-node bin/migrate-json-to-table.ts
 */
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const dump = false;
if (dump) {
    db.query('select * from documents where type=$1', ['tdoc']).then((res) => {
        const r: {}[] = [];
        console.log(res.rowCount);
        let cnt = 0;
        res.rows.forEach((row) => {
            r.push(row);
            cnt += 1;
        });
        console.log(r.length);
        fs.writeFileSync('tdocs.json', JSON.stringify(r, undefined, 2));
    });
}

type ExerciseLabel = 'solved' | 'important' | 'question' | 'fail';

interface TExercise {
    start: string;
    stop: string;
    name: string;
    created_at?: string;
    labels: ExerciseLabel[];
}

interface TimedDoc {
    chapter: string;
    exercises: TExercise[];
}

interface Document {
    id: number;
    user_id: number;
    web_key: string;
    type: 'tdoc';
    data: TimedDoc;
    created_at: string;
    updated_at: string;
}

const tdocs = require('./tdocs.json') as Document[];

const perform_insert = false;

if (perform_insert) {
    tdocs.forEach((doc) => {
        db.query(
            `
                INSERT INTO timed_topics
                    (user_id, web_key, data, updated_at, created_at)
                VALUES
                    ($1, $2, $3, $4, $5)
                RETURNING id`,
            [doc.user_id, doc.web_key, {}, doc.updated_at, doc.created_at]
        ).then((res) => {
            const tt_id = res.rows[0].id;
            console.log('tt', tt_id);
            doc.data.exercises.forEach((ex) => {
                let start = ex.start;
                let ende: string | null = ex.stop;
                if (!start && !ende) {
                    start = doc.created_at;
                    ende = doc.created_at;
                }
                if (!ende) {
                    ende = null;
                }
                db.query(
                    `
                    INSERT INTO timed_exercises
                        (topic_id, data, name, updated_at, created_at)
                    VALUES
                        ($1, $2, $3, $4, $5)
                    RETURNING id`,
                    [tt_id, { labels: ex.labels }, ex.name, ende || start, ex.created_at || start]
                ).then((res) => {
                    console.log('ts', res.rows[0]);
                    const te_id = res.rows[0].id;
                    db.query(
                        `
                        INSERT INTO time_spans
                            (exercise_id, start, stop)
                        VALUES
                            ($1, $2, $3)
                        RETURNING id`,
                        [te_id, start, ende]
                    );
                });
            });
        });
    });
}
