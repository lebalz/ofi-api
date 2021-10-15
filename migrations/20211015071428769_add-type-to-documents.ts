/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.db.query(
        'ALTER table documents ADD type VARCHAR(32)'
    ).then(() => {
        return Promise.all([
            pgm.db.query(
                "UPDATE documents SET type='code' WHERE data->>'code' IS NOT NULL"
            ),
            pgm.db.query(
                "UPDATE documents SET type=data->>'type' WHERE data->>'type' IS NOT NULL"
            )            
        ])
    }).then(() => {
        pgm.alterColumn(
            'documents',
            'type',
            {notNull: true}
        );
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn(
        'documents',
        'type',
    )
}
