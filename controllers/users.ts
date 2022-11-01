import { Comment } from './../models/comment';
import { TimedTopic } from './../models/TimedTopic';
import { Document } from './../models/document';
import { ErrorHandler, getMail } from './helpers';
import { RequestHandler } from 'express';
import { getOrCreate, setOid, setOidChanged, User } from '../models/user';
import { all as allDocuments } from '../models/document';
import { all as allTimedTopics } from '../models/TimedTopic';
import { all as allComments } from '../models/comment';
const current: RequestHandler = (req, res) => {
    const oid = (req.authInfo as any)!.oid as string;
    getOrCreate(getMail(req.authInfo), oid || '')
        .then((user) => {
            if (!user.oid) {
                setOid(user.id, oid).then((updatedUser) => {
                    res.status(200).json(updatedUser);
                })
            } else if (user.oid !== oid && !user.oid_changed) {
                setOidChanged(user.id, true).then((updatedUser) => {
                    res.status(200).json(updatedUser);
                })
            } else {
                res.status(200).json(user);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const data: RequestHandler<
    {},
    {
        user: User;
        documents: Document[];
        timed_topics: TimedTopic[];
        comments: Comment[];
    }
> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return Promise.all([
                Promise.resolve(user),
                allDocuments(user),
                allTimedTopics(user),
                allComments(user),
            ]);
        })
        .then(([user, docs, ttopics, comments]) => {
            res.status(200).json({
                user: user,
                documents: docs,
                timed_topics: ttopics,
                comments: comments,
            });
        })
        .catch((err) => ErrorHandler(res, err));
};

const Users = { current, data };
export default Users;
