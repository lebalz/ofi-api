/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('comments', {
        id: 'id',
        user_id: { type: 'integer', references: 'users(id)' },
        page_key: { type: 'string', notNull: true },
        locator: { type: 'json', notNull: true },
        data: { type: 'json', notNull: true },
        related_to: { type: 'integer', references: 'comments(id)', notNull: false},
        updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')}, 
        created_at: { type: 'timestamp', notNull: true, default: { literal: true, value: 'current_timestamp'}}
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('comments', { ifExists: true });
}
