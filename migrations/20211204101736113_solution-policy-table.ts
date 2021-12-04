/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('solution_policies', {
        web_key: { type: 'character varying(36)', primaryKey: true },
        document_url: { type: 'string', default: '' },
        authorized_classes: { type: 'character varying(16)[]', default: '{}' },
        authorized_users: { type: 'character varying(64)[]', default: '{}' },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('solution_policies', { ifExists: true });
}
