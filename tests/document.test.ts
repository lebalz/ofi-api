import { create as createDocument, update as updateDocument } from './../models/document';
import request from 'supertest';
import app from '../app';
import { query, close } from '../db';
import { User } from '../models/user';
import { Document, Version } from '../models/document';
const user: User = {
    id: 1,
    admin: false,
    email: 'foo@bar.ch',
    groups: [],
    class: '69x',
    created_at: '2021-11-11',
    updated_at: '2021-11-12',
};

afterAll(() => {
    close();
});

describe('GET /api/document/:web_key', () => {
    beforeEach(() => {
        return query('START TRANSACTION', []);
    });
    afterEach(() => {
        return query('ROLLBACK', []);
    });
    it('returns empty body when document is not found', async () => {
        const uuid = 'd4e44b5f-ca9f-4223-aa0b-c95cdda0b067';
        const result = await request(app)
            .get(`/api/document/${uuid}&versions=0`)
            .set('authorization', JSON.stringify({ email: user.email }));
        expect(result.statusCode).toEqual(200);
        expect(result.body).toBe('');
        expect(result.text).toBe('');
    });
    describe('with documents', () => {
        const uuid = 'd4e44b5f-ca9f-4223-aa0b-c95cdda0b067';
        beforeEach(async () => {
            await query('START TRANSACTION', []);
            await query('INSERT INTO users (id, email) VALUES ($1, $2) RETURNING *', [user.id, user.email]);
            await createDocument(user, {
                type: 'text',
                web_key: uuid,
                data: { type: 'text', value: '<b></b>' },
            });
            // add a version
            await updateDocument(user, uuid, { type: 'text', value: '<b>Test</b>' }, true);
            await updateDocument(user, uuid, { type: 'text', value: '<b>Testing</b>' }, true);
        });
        afterEach(async () => {
            await query('ROLLBACK', []);
        });
        it('returns the document', async () => {
            const result = await request(app)
                .get(`/api/document/${uuid}`)
                .set('authorization', JSON.stringify({ email: user.email }));
            expect(result.statusCode).toEqual(200);
            const doc = result.body as Document;
            expect(doc.user_id).toEqual(user.id);
            expect(doc.web_key).toEqual(uuid);
            expect(doc.type).toEqual('text');
            expect((doc.data as {type: string, value: string}).type).toEqual('text');
            expect((doc.data as {type: string, value: string}).value).toEqual('<b>Testing</b>');
            expect(doc.versions.length).toEqual(0);

        });
        it('returns the document with versions', async () => {
            const result = await request(app)
                .get(`/api/document/${uuid}?versions=1`)
                .set('authorization', JSON.stringify({ email: user.email }));
            expect(result.statusCode).toEqual(200);
            const doc = result.body as Document;
            expect(doc.user_id).toEqual(user.id);
            expect(doc.web_key).toEqual(uuid);
            expect(doc.type).toEqual('text');
            expect((doc.data as {type: string, value: string}).type).toEqual('text');
            expect((doc.data as {type: string, value: string}).value).toEqual('<b>Testing</b>');
            expect(doc.versions.length).toEqual(2);
            expect(((doc.versions[0] as Version).data as {type: string, value: string}).value).toEqual('<b>Test</b>');
            expect(((doc.versions[1] as Version).data as {type: string, value: string}).value).toEqual('<b>Testing</b>');
        });
    });
});
