import express, { Response } from 'express';
import path from 'path';
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import { Server, Socket } from 'socket.io';
import { Pool, QueryResult } from 'pg';
import { BearerStrategy, IBearerStrategyOptionWithRequest, VerifyBearerFunction } from 'passport-azure-ad';
import passport from 'passport';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Set the Azure AD B2C options
const auth = {
    tenantID: process.env.TENANT_ID,
    clientID: process.env.CLIENT_ID,
    audience: process.env.CLIENT_ID,
    authority: 'login.microsoftonline.com',
    version: 'v2.0',
    discovery: '.well-known/openid-configuration',
    scope: ['access_as_user'],
    validateIssuer: true,
    passReqToCallback: false,
    loggingLevel: 'info',
};

const options: IBearerStrategyOptionWithRequest = {
    identityMetadata: `https://${auth.authority}/${auth.tenantID}/${auth.version}/${auth.discovery}`,
    issuer: `https://${auth.authority}/${auth.tenantID}/${auth.version}`,
    clientID: auth.clientID || '',
    audience: auth.audience,
    validateIssuer: auth.validateIssuer,
    passReqToCallback: auth.passReqToCallback,
    loggingLevel: auth.loggingLevel as 'info' | 'warn' | 'error' | undefined,
    scope: auth.scope,
};

const BearerVerify: VerifyBearerFunction = (token, done) => {
    // Send user info using the second argument
    done(null, {}, token);
};

const bearerStrategy = new BearerStrategy(options, BearerVerify);

const app = express();
app.use(express.json({limit: '5mb'}));

/**
 * CREATE A SERVER OBJECT
 */
const server = http.createServer(app);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// ensure the server can call other domains: enable cross origin resource sharing (cors)
app.use(cors());

// received packages should be presented in the JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// show some helpful logs in the commandline
app.use(morgan('combined'));

passport.use(bearerStrategy);

// Enable CORS (for local testing only -remove in production/deployment)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Authorization, Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

interface User {
    id: number;
    email: string;
    class?: string;
    updated_at: string;
    created_at: string;
}

interface DocumentPayload {
    web_key: string;
    data: JSON;
    type: string;
}

interface Document extends DocumentPayload {
    user_id: number;
    id: number;
    updated_at: string;
    created_at: string;
}

const getOrCreateUserByMail = (mail: string, callback: (user: User) => void, reqRes: Response) => {
    pool.query('SELECT * FROM users WHERE email = $1', [mail.toLowerCase()], (error, results) => {
        if (error) {
            console.error(error);
            return reqRes.status(500).send(error.name);
        }
        if (results.rowCount == 0) {
            pool.query(
                'INSERT INTO users (email) VALUES ($1) RETURNING *',
                [mail.toLowerCase()],
                (error, res) => {
                    if (error) {
                        console.error(error);
                        return reqRes.status(500).send(error.name);
                    }
                    if (res.rowCount == 0) {
                        console.error(error);
                        return reqRes.status(500).send(`NO USER "${mail}" FOUND`);
                    }
                    callback(res.rows[0]);
                }
            );
        } else {
            callback(results.rows[0]);
        }
    });
};

const getMail = (authInfo?: Express.AuthInfo) => {
    if (!authInfo) {
        throw 'No AuthInfo provided';
    }
    return (authInfo as any).preferred_username.toLowerCase();
};

const query = (sql: string, values: any[], onSuccess: (res: QueryResult<any>) => void, res: Response) => {
    pool.query(sql, values, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).send(error.name);
        }
        return onSuccess(result);
    });
};

// Expose and protect API endpoint
app.get('/api/user', passport.authenticate('oauth-bearer', { session: false }), (req, res) => {
    getOrCreateUserByMail(
        getMail(req.authInfo),
        (user) => {
            res.status(200).json(user);
        },
        res
    );
});

app.get('/api/document/:web_key', passport.authenticate('oauth-bearer', { session: false }), (req, res) => {
    getOrCreateUserByMail(
        getMail(req.authInfo),
        (user) => {
            query(
                'SELECT * FROM documents WHERE user_id=$1 and web_key=$2',
                [user.id, req.params.web_key],
                (result) => {
                    if (result.rowCount > 0) {
                        res.status(200).json(result.rows[0]);
                    } else {
                        res.status(200).json(undefined);
                    }
                },
                res
            );
        },
        res
    );
});

app.post('/api/document', passport.authenticate('oauth-bearer', { session: false }), (req, res) => {
    const { data, web_key, type }: DocumentPayload = req.body;

    getOrCreateUserByMail(
        getMail(req.authInfo),
        (user) => {
            query(
                'INSERT INTO documents (user_id, web_key, data, type) VALUES ($1,$2,$3,$4) RETURNING *',
                [user.id, web_key, data, type],
                (result) => {
                    if (result.rowCount == 1) {
                        res.status(201).json(result.rows[0]);
                    } else {
                        res.status(500).send('COULD NOT CREATE A DOCUMENT');
                    }
                },
                res
            );
        },
        res
    );
});

app.put('/api/document/:web_key', passport.authenticate('oauth-bearer', { session: false }), (req, res) => {
    const { data } = req.body;
    getOrCreateUserByMail(
        getMail(req.authInfo),
        (user) => {
            query(
                'UPDATE documents SET data=$1, updated_at=current_timestamp WHERE user_id=$2 and web_key=$3 RETURNING updated_at',
                [data, user.id, req.params.web_key],
                (result) => {
                    res.status(200).json({...result.rows[0], state: 'ok'});
                },
                res
            );
        },
        res
    );
});

app.delete('/api/document/:web_key', passport.authenticate('oauth-bearer', { session: false }), (req, res) => {
    getOrCreateUserByMail(
        getMail(req.authInfo),
        (user) => {
            query(
                'DELETE FROM documents WHERE user_id=$1 and web_key=$2',
                [user.id, req.params.web_key],
                (result) => {
                    res.status(200).send('ok');
                },
                res
            );
        },
        res
    );
});

const io = new Server(server, {});

io.on('connection', (socket: Socket) => {
    // ...
});

server.listen(process.env.PORT || 3001);
