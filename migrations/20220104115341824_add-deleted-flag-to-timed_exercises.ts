/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn('timed_exercises', { deleted: { type: 'boolean', notNull: true, default: false } });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn('timed_exercises', 'deleted');
}
