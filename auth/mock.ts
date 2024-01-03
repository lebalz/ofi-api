import { query } from '../db';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { User } from 'models/user';
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport';
import { ParsedQs } from 'qs';
class MockStrat extends Strategy {
    name = 'oauth-bearer';
    constructor() {
        super();
    }
    async authenticate(
        this: StrategyCreated<this, this & StrategyCreatedStatic>,
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        options?: any
    ) {
        const authorization = req.headers.authorization;
        if (!authorization) {
            if (process.env.TEST_USER_EMAIL) {
                try {
                    const user = await query<User>('SELECT * FROM users WHERE email = $1', [process.env.TEST_USER_EMAIL.toLowerCase()]);
                    if (user.rowCount === 1) {
                        return this.success({ preferred_username: process.env.TEST_USER_EMAIL, oid: user.rows[0].oid || '' }, { preferred_username: process.env.TEST_USER_EMAIL, oid: user.rows[0].oid || '' });
                    }
                } catch (err) {
                    console.error(err);
                    /** do nothing... */
                }
            }
            return this.error('Unauthorized');
        }
        const auth = JSON.parse(authorization) as { email: string, oid?: string };
        if (!auth.email) {
            return this.fail('Unauthorized');
        }
        return this.success({ preferred_username: auth.email, oid: auth.oid || '' }, { preferred_username: auth.email, oid: auth.oid || '' });
    }
}

export const getStrategy = () => {
    const strategy = new MockStrat();
    return strategy;
};

// (username, password, done) => {
//     if (password === 'unauthenticated') {
//         return done('Unauthenticated');
//     }
//     return done(null, {
//         preferred_username: username,
//     });
// }
