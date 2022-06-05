import { ErrorHandler, getMail } from './helpers';
import { RequestHandler } from 'express';
import { getOrCreate } from '../models/user';
import { all as allDocuments } from '../models/document';
import { all as allTimedTopics } from '../models/TimedTopic';
const current: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => ErrorHandler(res, err));
};

const data: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return Promise.all([
                Promise.resolve(user),
                allDocuments(user),
                allTimedTopics(user)
            ]);
        }).then(([user, docs, ttopics]) => {
            res.status(200).json({
                user: user,
                documents: docs,
                timed_topics: ttopics
            });
        })
        .catch((err) => ErrorHandler(res, err));
};

const Users = { current, data };
export default Users;
