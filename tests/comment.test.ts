import request from 'supertest';
import app from '../app';
import { close } from '../db';
import { Comment, findAllByPage } from '../models/comment';
import { findByMail } from '../models/user';
import { getOrCreate, userProps } from './factories/users';
import { create as createCom } from './factories/comments';
import { truncate } from './helpers/db';

const uuid = '88693898-7e42-496a-a67e-a648d8fa80d6';
const user = userProps();

beforeAll(() => {
    return truncate();
});
afterAll(() => {
    return close();
});

describe('/api/comment', () => {
    beforeEach(() => {
        return getOrCreate(user);
    });
    afterEach(() => {
        return truncate();
    });

    describe('GET /api/comment/:page_key', () => {
        it('returns empty body when comment is not found', async () => {
            const result = await request(app)
                .get(`/api/comment/${uuid}`)
                .set('authorization', JSON.stringify({ email: user.email }));
            expect(result.statusCode).toEqual(200);
            expect(result.body.length).toBe(0);
        });
        describe('with comments', () => {
            beforeEach(() => {
                return createCom({
                    user_id: user.id,
                    page_key: uuid,
                    data: { comment: '<b>Testing</b>' },
                    locator: { type: 'paragraph', nr: 3}
                });
            });
            it('returns the comment', async () => {
                const result = await request(app)
                    .get(`/api/comment/${uuid}`)
                    .set('authorization', JSON.stringify({ email: user.email }));
                expect(result.statusCode).toEqual(200);
                const com = result.body as Comment[];
                expect(com.length).toBe(1);

                expect(com[0].user_id).toEqual(user.id);
                expect(com[0].page_key).toEqual(uuid);
                expect((com[0].locator as { type: string; nr: number }).type).toEqual('paragraph');
                expect((com[0].locator as { type: string; nr: number }).nr).toEqual(3);
                expect((com[0].data as { comment: string }).comment).toEqual('<b>Testing</b>');
            });
        });
    });

    describe('PUT /api/comment/:page_key', () => {
        const ID = 32;
        beforeEach(() => {
            return createCom({
                id: ID,
                user_id: user.id,
                page_key: uuid,
                data: { comment: '<b>...</b>' },
                locator: { type: 'paragraph', nr: 3}
            });
        });
        it('can update comments', async () => {
            const result = await request(app)
                .put(`/api/comment/${ID}`)
                .set('authorization', JSON.stringify({ email: user.email }))
                .send({ data: { comment: 'foo bar' } });
            expect(result.statusCode).toEqual(200);
            expect(result.body.state).toBe('ok');
            const updated = await findAllByPage(user.id, uuid);
            expect(updated.length).toEqual(1);
            expect(updated[0]!.updated_at).toEqual(new Date(result.body.updated_at));
            expect(updated[0]!.data).toEqual({ comment: 'foo bar' });
        });
    });

    describe('POST /api/comment/:page_key', () => {
        let bla: jest.SpyInstance;
        beforeAll(() => {
            bla = jest.spyOn(global.console, 'error').mockImplementation(() => {});
        });
        afterAll(() => {
            bla.mockRestore();
        });

        beforeEach(() => {
            return createCom({
                user_id: user.id,
                page_key: uuid,
                data: { comment: 'whatever' },
            });
        });

        it('can create comments', async () => {
            const newUuid = '36266c79-72d7-405d-8119-889ffd2c23df';
            const init = await findAllByPage(user.id, newUuid);
            expect(init.length).toEqual(0)
            const result = await request(app)
                .post('/api/comment')
                .set('authorization', JSON.stringify({ email: user.email }))
                .send({ page_key: newUuid, data: { comment: 'nilpferd' }, locator: { type: 'paragraph', nr: 1} });
            expect(result.statusCode).toEqual(201);            
            const created = await findAllByPage(user.id, newUuid);
            expect(created.length).toEqual(1);
            expect(created[0]!.data).toEqual({ comment: 'nilpferd' });
        });

        it('can create multiple documents with the same page_key', async () => {
            const result = await request(app)
                .post('/api/comment')
                .set('authorization', JSON.stringify({ email: user.email }))
                .send({ page_key: uuid, data: { comment: 'nilpferd' }, locator: { type: 'paragraph', nr: 1} });
            expect(result.statusCode).toEqual(201);           
            const created = await findAllByPage(user.id, uuid);
            expect(created.length).toEqual(2);
            expect(created[1]!.data).toEqual({ comment: 'nilpferd' });
        });
    });

    describe('DELETE /api/document/:page_key', () => {
        const ID = 34;
        beforeEach(() => {
            return createCom({
                id: ID,
                user_id: user.id,
                page_key: uuid,
                data: { comment: '' },
            });
        });
        it('can update documents', async () => {
            const init = await findAllByPage(user.id, uuid);
            expect(init.length).toEqual(1);
            const result = await request(app)
                .delete(`/api/comment/${ID}`)
                .set('authorization', JSON.stringify({ email: user.email }));
            expect(result.statusCode).toEqual(200);
            expect(result.text).toBe('ok');
            const deleted = await findAllByPage(user.id, uuid);
            expect(deleted.length).toEqual(0);
        });
    });
});
