/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
      pgm.addConstraint(
          'documents',
          'unique_web_keys',
          {unique: ['user_id', 'web_key']}
      );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint('documents', 'unique_web_keys');
}
