import { CommentPayload } from './models/comment';
import { strategyForEnvironment } from './auth/index';
import Users from './controllers/users';
import Documents from './controllers/documents';
import Comments from './controllers/comments';
import TimedTopics from './controllers/timed_topics';
import TimedExercises from './controllers/timed_exercises';
import TimeSpans from './controllers/time_spans';
import SolutionPolicies from './controllers/solution_policies';
import Admin from './controllers/admin';
import express, { Request } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import compression from 'compression';
import { DocumentPayload } from 'models/document';
import { RequestHandler } from 'express';
// import {default as gtts} from 'gtts';
const Gtts = require('gtts');

// import gtts from 'better-node-gtts';

const app = express();
app.use(compression(), express.json({ limit: '5mb' }));

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// ensure the server can call other domains: enable cross origin resource sharing (cors)
app.use(cors());

// received packages should be presented in the JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// show some helpful logs in the commandline
app.use(morgan('combined'));
passport.use(strategyForEnvironment());
app.use(passport.initialize());

// Enable CORS (for local testing only -remove in production/deployment)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Authorization, Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

// Public Endpoints
app.get('/api', (req, res) => {
    return res.status(200).send('Welcome to the OFI-API.');
});

// Expose and protect API endpoint
app.get('/api/user', passport.authenticate('oauth-bearer', { session: false }), Users.current);

app.get('/api/user/data', passport.authenticate('oauth-bearer', { session: false }), Users.data);

app.get(
    '/api/admin/document/:uid/:web_key&:versions',
    passport.authenticate('oauth-bearer', { session: false }),
    Admin.find
);

app.get(
    '/api/gtts',
    passport.authenticate('oauth-bearer', { session: false }),
    (req: Request<{}, {}, {}, { lang?: 'de' | 'en' | 'fr', text: string }>, res) => {
        res.set({ 'Content-Type': 'audio/mpeg' });
        const gtts = new Gtts(req.query.text, req.query.lang || 'de');
        gtts.stream().pipe(res);
    }
)

// --- todo here!
app.get(
    '/api/admin/document/find_all_by',
    passport.authenticate('oauth-bearer', { session: false }),
    Admin.findAllBy
);

app.get(
    '/api/admin/policy/solution/:uid/:web_key',
    passport.authenticate('oauth-bearer', { session: false }),
    Admin.solutionPolicy
);

app.get(
    '/api/admin/policy/solution',
    passport.authenticate('oauth-bearer', { session: false }),
    Admin.solutionPolicies
);

app.put(
    '/api/admin/policy/solution/:web_key',
    passport.authenticate('oauth-bearer', { session: false }),
    Admin.modifySolutionPolicy
);

app.get(
    '/api/admin/timed_topics/:uid/:web_key',
    passport.authenticate('oauth-bearer', { session: false }),
    Admin.findTopic
);

app.get(
    '/api/admin/comments/:uid/:page_key',
    passport.authenticate('oauth-bearer', { session: false }),
    Admin.findComments
);

app.get('/api/admin/users', passport.authenticate('oauth-bearer', { session: false }), Admin.users);

app.put('/api/admin/users/:uid', passport.authenticate('oauth-bearer', { session: false }), Admin.updateUser);

app.get('/api/document/:web_key', passport.authenticate('oauth-bearer', { session: false }), Documents.find);

app.post<DocumentPayload>(
    '/api/document',
    passport.authenticate('oauth-bearer', { session: false }),
    Documents.create
);

app.put(
    '/api/document/:web_key',
    passport.authenticate('oauth-bearer', { session: false }),
    Documents.update
);

app.delete(
    '/api/document/:web_key',
    passport.authenticate('oauth-bearer', { session: false }),
    Documents.delete
);

app.get(
    '/api/comment/:page_key',
    passport.authenticate('oauth-bearer', { session: false }),
    Comments.allByPage
);

app.post<CommentPayload>(
    '/api/comment',
    passport.authenticate('oauth-bearer', { session: false }),
    Comments.create
);

app.put('/api/comment/:id', passport.authenticate('oauth-bearer', { session: false }), Comments.update);

app.delete('/api/comment/:id', passport.authenticate('oauth-bearer', { session: false }), Comments.delete);

app.get(
    '/api/timed_topics/:web_key',
    passport.authenticate('oauth-bearer', { session: false }),
    TimedTopics.find
);

app.post('/api/timed_topics', passport.authenticate('oauth-bearer', { session: false }), TimedTopics.create);

app.post(
    '/api/timed_topics/:id',
    passport.authenticate('oauth-bearer', { session: false }),
    TimedExercises.create
);

app.put(
    '/api/timed_topics/:id/:exercise_id',
    passport.authenticate('oauth-bearer', { session: false }),
    TimedExercises.update
);

app.delete(
    '/api/timed_topics/:id/:exercise_id',
    passport.authenticate('oauth-bearer', { session: false }),
    TimedExercises.delete
);

app.post(
    '/api/timed_topics/:id/:exercise_id',
    passport.authenticate('oauth-bearer', { session: false }),
    TimeSpans.create
);

app.put(
    '/api/timed_topics/:id/:exercise_id/:span_id',
    passport.authenticate('oauth-bearer', { session: false }),
    TimeSpans.stop
);

app.get(
    '/api/policy/solutions/:web_key',
    passport.authenticate('oauth-bearer', { session: false }),
    SolutionPolicies.authorized
);

app.post(
    '/api/policy/solutions',
    passport.authenticate('oauth-bearer', { session: false }),
    SolutionPolicies.create
);

export default app;
