import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport';
import { ParsedQs } from 'qs';
class MockStrat extends Strategy {
    name = 'oauth-bearer';
    constructor() {
        super();
    }
    authenticate(
        this: StrategyCreated<this, this & StrategyCreatedStatic>,
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        options?: any
    ) {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return this.error('Unauthorized');
        }
        const auth = JSON.parse(authorization) as { email: string, oid?: string };
        if (!auth.email) {
            return this.fail('Unauthorized');
        }
        return this.success({ preferred_username: auth.email, oid: auth.oid || 'adceb229-cb4e-481e-a591-7aa6f94a06c7' }, { preferred_username: auth.email, oid: auth.oid || 'adceb229-cb4e-481e-a591-7aa6f94a06c7' });
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
