/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('timed_topics', {
        id: 'id',
        user_id: { type: 'integer', references: 'users(id)', onDelete: 'CASCADE' },
        web_key: { type: 'VARCHAR(36)', notNull: true },
        data: { type: 'json', notNull: true },
        updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    });
    pgm.addConstraint('timed_topics', 'timed_topics_unique_web_keys', { unique: ['user_id', 'web_key'] });
    pgm.createTable('timed_exercises', {
        id: 'id',
        topic_id: { type: 'integer', references: 'timed_topics(id)', onDelete: 'CASCADE' },
        data: { type: 'json', notNull: true },
        name: { type: 'string' },
        updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    });
    pgm.createTable('time_spans', {
        id: 'id',
        exercise_id: { type: 'integer', references: 'timed_exercises(id)', onDelete: 'CASCADE' },
        start: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        stop: { type: 'timestamp' },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('time_spans', { ifExists: true });
    pgm.dropTable('timed_exercises', { ifExists: true });
    pgm.dropTable('timed_topics', { ifExists: true });
}
