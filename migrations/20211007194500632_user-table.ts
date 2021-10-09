/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('users', {
        id: 'id',
        email: { type: 'string', notNull: true, unique: true },
        class: { type: 'string'},
        updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')}, 
        created_at: { type: 'timestamp', notNull: true, default: { literal: true, value: 'current_timestamp'}}
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
