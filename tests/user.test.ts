import passport from 'passport';
import request from 'supertest';
import app from '../app';
import { query } from '../db';

describe('GET /api/user authorized', () => {
    beforeEach(() => {
        return query('START TRANSACTION', []);
    });
    afterEach(() => {
        return query('ROLLBACK', []);
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
});
