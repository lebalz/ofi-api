import request from 'supertest';
import app from '../app';
import { query, close } from '../db';
import { truncate } from './helpers/db';
import { create as createDoc } from './factories/documents';
import { forEach } from 'lodash';

beforeAll(() => {
    return truncate();
});

afterAll(() => {
    return close();
});

describe('GET /api/user authorized', () => {
    afterEach(() => {
        return truncate();
    });
    it('rejects unauthorized users', async () => {
        const result = await request(app)
            .get('/api/user')
            .set('authorization', JSON.stringify({ noAuth: true }));
        expect(result.statusCode).toEqual(401);
    });
    it('authenticates users', async () => {
        const userCount = (await query('SELECT * FROM users', [])).rowCount;
        expect(userCount).toBe(0);
        const result = await request(app)
            .get('/api/user')
            .set('authorization', JSON.stringify({ email: 'foo@bar.ch' }));
        expect(result.statusCode).toEqual(200);
        expect(result.body.email).toEqual('foo@bar.ch');
        expect(result.body.admin).toEqual(false);
        expect(result.body.groups).toEqual([]);
    });
    it('adds missing oid', async () => {
        const userCount = (await query('SELECT * FROM users', [])).rowCount;
        expect(userCount).toBe(0);
        const result = await request(app)
            .get('/api/user')
            .set('authorization', JSON.stringify({ email: 'foo@bar.ch', oid: '' }));
        expect(result.statusCode).toEqual(200);
        expect(result.body.oid).toEqual('');
        expect(result.body.oid_changed).toBeFalsy();
        const result2 = await request(app)
            .get('/api/user')
            .set('authorization', JSON.stringify({ email: 'foo@bar.ch', oid: 'blablii' }));
        expect(result2.statusCode).toEqual(200);
        expect(result2.body.oid).toEqual('blablii');
        expect(result2.body.oid_changed).toBeFalsy();
    });
    it('tracks oid change', async () => {
        const userCount = (await query('SELECT * FROM users', [])).rowCount;
        expect(userCount).toBe(0);
        const result = await request(app)
            .get('/api/user')
            .set('authorization', JSON.stringify({ email: 'foo@bar.ch', oid: 'blabluu' }));
        expect(result.statusCode).toEqual(200);
        expect(result.body.oid).toEqual('blabluu');
        expect(result.body.oid_changed).toBeFalsy();
        const result2 = await request(app)
            .get('/api/user')
            .set('authorization', JSON.stringify({ email: 'foo@bar.ch', oid: 'blablii' }));
        expect(result2.statusCode).toEqual(200);
        expect(result2.body.oid).toEqual('blabluu');
        expect(result2.body.oid_changed).toBeTruthy();
    });
});

describe('GET /api/user/data', () => {
    afterEach(() => {
        return truncate();
    });
    it('returns all data of a user', async () => {
        const userCount = (await query('SELECT * FROM users', [])).rowCount;
        expect(userCount).toBe(0);
        const result = await request(app)
            .get('/api/user/data')
            .set('authorization', JSON.stringify({ email: 'foo@bar.ch' }));
        expect(result.statusCode).toEqual(200);
        const user = result.body.user;
        expect(user.email).toEqual('foo@bar.ch');
        expect(result.body.documents).toEqual([]);
        expect(result.body.timed_topics).toEqual([]);

        // add some documents
        await createDoc({
            user_id: user.id,
            type: 'text',
            web_key: 'fe21324d-b80d-48c0-8ee2-0d98af0e72f8',
            data: { type: 'text', value: 'hello' },
        });
        await createDoc({
            user_id: user.id,
            type: 'code',
            web_key: '1e928a26-71ea-45f2-98cb-f9fda6ca3665',
            data: { code: "print('hello world')" },
        });
        const result2 = await request(app)
            .get('/api/user/data')
            .set('authorization', JSON.stringify({ email: 'foo@bar.ch' }));
        expect(result2.statusCode).toEqual(200);
        expect(result2.body.documents.length).toEqual(2);
        const toCheck = ['fe21324d-b80d-48c0-8ee2-0d98af0e72f8', '1e928a26-71ea-45f2-98cb-f9fda6ca3665'];
        forEach(result2.body.documents, (doc) => {
            expect(toCheck).toContain(doc.web_key);
            if (toCheck.indexOf(doc.web_key) === 0) {
                toCheck.shift();
            } else {
                toCheck.pop();
            }
        });
        expect(result2.body.timed_topics).toEqual([]);
    });
});
