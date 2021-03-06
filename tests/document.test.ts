import request from 'supertest';
import app from '../app';
import { close } from '../db';
import { Document, Version, find as findDoc } from '../models/document';
import { findByMail } from '../models/user';
import { getOrCreate, userProps } from './factories/users';
import { create as createDoc } from './factories/documents';
import { truncate } from './helpers/db';

const uuid = 'd4e44b5f-ca9f-4223-aa0b-c95cdda0b067';
const user = userProps();

beforeAll(() => {
    return truncate();
});
afterAll(() => {
    return close();
});

describe('/api/document', () => {
    beforeEach(() => {
        return getOrCreate(user);
    });
    afterEach(() => {
        return truncate();
    });

    describe('GET /api/document/:web_key', () => {
        it('returns empty body when document is not found', async () => {
            const result = await request(app)
                .get(`/api/document/${uuid}`)
                .set('authorization', JSON.stringify({ email: user.email }));
            expect(result.statusCode).toEqual(200);
            expect(result.body).toBe('');
            expect(result.text).toBe('');
        });
        describe('with documents', () => {
            beforeEach(() => {
                return createDoc({
                    user_id: user.id,
                    type: 'text',
                    web_key: uuid,
                    data: { type: 'text', value: '<b>Testing</b>' },
                    versions: [
                        {
                            version: '2022-01-02',
                            data: { type: 'text', value: '<b></b>' },
                            pasted: false,
                        },
                        {
                            version: '2022-01-03',
                            data: { type: 'text', value: '<b>Test</b>' },
                            pasted: false,
                        },
                    ],
                });
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
                expect((doc.data as { type: string; value: string }).type).toEqual('text');
                expect((doc.data as { type: string; value: string }).value).toEqual('<b>Testing</b>');
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
                expect((doc.data as { type: string; value: string }).type).toEqual('text');
                expect((doc.data as { type: string; value: string }).value).toEqual('<b>Testing</b>');
                expect(doc.versions.length).toEqual(2);
                expect(((doc.versions[0] as Version).data as { type: string; value: string }).value).toEqual(
                    '<b></b>'
                );
                expect(((doc.versions[1] as Version).data as { type: string; value: string }).value).toEqual(
                    '<b>Test</b>'
                );
            });
        });
    });

    describe('PUT /api/document/:web_key', () => {
        beforeEach(() => {
            return createDoc({
                user_id: user.id,
                type: 'text',
                web_key: uuid,
                data: { type: 'text', value: '' },
            });
        });
        it('can update documents', async () => {
            const result = await request(app)
                .put(`/api/document/${uuid}`)
                .set('authorization', JSON.stringify({ email: user.email }))
                .send({ data: { type: 'text', value: 'foo bar' } });
            expect(result.statusCode).toEqual(200);
            expect(result.body.state).toBe('ok');
            const updated = await findDoc(user.id, uuid);
            expect(updated).not.toBeUndefined();
            expect(updated!.updated_at).toEqual(new Date(result.body.updated_at));
            expect(updated!.data).toEqual({ type: 'text', value: 'foo bar' });
        });
    });

    describe('POST /api/document/:web_key', () => {
        let bla: jest.SpyInstance;
        beforeAll(() => {
            bla = jest.spyOn(global.console, 'error').mockImplementation(() => {});
        });
        afterAll(() => {
            bla.mockRestore();
        });

        beforeEach(() => {
            return createDoc({
                user_id: user.id,
                type: 'text',
                web_key: uuid,
                data: { type: 'text', value: 'whatever' },
            });
        });

        it('can create documents', async () => {
            const newUuid = '1f022bda-0db3-4bc2-8af2-21ab7a5bbb3f';
            const init = await findDoc(user.id, newUuid);
            expect(init).toBeUndefined();
            const result = await request(app)
                .post('/api/document')
                .set('authorization', JSON.stringify({ email: user.email }))
                .send({ web_key: newUuid, type: 'text', data: { type: 'text', value: 'foo bar' } });
            expect(result.statusCode).toEqual(201);
            const created = await findDoc(user.id, newUuid);
            expect(created).not.toBeUndefined();
            expect(created!.data).toEqual({ type: 'text', value: 'foo bar' });
        });

        it('can not create multiple documents with same uuid', async () => {
            const result = await request(app)
                .post('/api/document')
                .set('authorization', JSON.stringify({ email: user.email }))
                .send({ web_key: uuid, type: 'text', data: { type: 'text', value: 'foo bar' } });
            expect(result.statusCode).toEqual(500);
            expect(result.text).toEqual('error');
        });
    });

    describe('DELETE /api/document/:web_key', () => {
        beforeEach(() => {
            return createDoc({
                user_id: user.id,
                type: 'text',
                web_key: uuid,
                data: { type: 'text', value: '' },
            });
        });
        it('can update documents', async () => {
            const init = await findDoc(user.id, uuid);
            expect(init).not.toBeUndefined();
            const result = await request(app)
                .delete(`/api/document/${uuid}`)
                .set('authorization', JSON.stringify({ email: user.email }));
            expect(result.statusCode).toEqual(200);
            expect(result.text).toBe('ok');
            const deleted = await findDoc(user.id, uuid);
            expect(deleted).toBeUndefined();
        });
    });
});
