import passport from 'passport';
import request from 'supertest';
import app from '../app';

describe('GET /api', () => {
    it("returns 'Welcome to the OFI-API.'", async () => {
        const result = await request(app).get('/api');
        expect(result.text).toEqual('Welcome to the OFI-API.');
        expect(result.statusCode).toEqual(200);
    });
});
