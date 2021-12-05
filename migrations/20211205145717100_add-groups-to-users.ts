/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn('users', { groups: { type: 'character varying(64)[]', default: '{}' } });
    pgm.addColumn('solution_policies', {
        authorized_groups: { type: 'character varying(64)[]', default: '{}' },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn('users', 'groups');
    pgm.dropColumn('solution_policies', 'authorized_groups');
}
