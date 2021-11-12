/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn('users', {admin: {type: 'boolean', notNull: true, default: false}})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn(
        'users',
        'admin'
    )
}
