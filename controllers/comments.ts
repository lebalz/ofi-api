import {
    CommentPayload,
    findAllByPage as findAllByPage,
    create as createComment,
    update as updateComment,
    remove as deleteComment
} from './../models/comment';
import { RequestHandler } from 'express';
import { getMail, ErrorHandler } from './helpers';
import { getOrCreate } from './../models/user';

const allByPage: RequestHandler<{ page_key: string}> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return findAllByPage(user.id, req.params.page_key);
        })
        .then((comments) => {
            if (comments) {
                res.status(200).send(comments);
            } else {
                res.status(200).json(undefined);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const create: RequestHandler<CommentPayload> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return createComment(user, req.body);
        })
        .then((document) => {
            if (document) {
                res.status(201).json(document);
            } else {
                res.status(500).send('COULD NOT CREATE DOCUMENT');
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const update: RequestHandler<{ id: number }, any, { data: any; locator?: any }> =
    (req, res) => {
        const { data, locator } = req.body;
        getOrCreate(getMail(req.authInfo))
            .then((user) => {
                return updateComment(user, req.params.id, data, locator);
            })
            .then((result) => {
                if (result) {
                    res.status(200).json({ ...result, state: 'ok' });
                } else {
                    res.status(500).send('COULD NOT UPDATE');
                }
            })
            .catch((err) => ErrorHandler(res, err));
    };

const remove: RequestHandler<{ id: number }> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return deleteComment(user, req.params.id);
        })
        .then(() => {
            res.status(200).send('ok');
        })
        .catch((err) => ErrorHandler(res, err));
};

const Comments = { allByPage, create, update, delete: remove};
export default Comments;
