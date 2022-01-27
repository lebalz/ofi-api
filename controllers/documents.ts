import {
    DocumentPayload,
    find as findDocument,
    create as createDocument,
    update as updateDocument,
    remove as deleteDocument,
} from './../models/document';
import { RequestHandler } from 'express';
import { getMail, ErrorHandler } from './helpers';
import { getOrCreate } from './../models/user';

const find: RequestHandler<{ web_key: string}, any, any, {versions?: boolean}> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return findDocument(user.id, req.params.web_key, req.query.versions);
        })
        .then((document) => {
            if (document) {
                res.status(200).send(document);
            } else {
                res.status(200).json(undefined);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const create: RequestHandler<DocumentPayload> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return createDocument(user, req.body);
        })
        .then((document) => {
            if (document) {
                res.status(201).json(document);
            } else {
                res.status(500).send('COULD NOT CREATE');
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const update: RequestHandler<{ web_key: string }, any, { data: any; snapshot?: boolean; pasted?: boolean }> =
    (req, res) => {
        const { data, snapshot, pasted } = req.body;
        getOrCreate(getMail(req.authInfo))
            .then((user) => {
                return updateDocument(user, req.params.web_key, data, snapshot, pasted);
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

const remove: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return deleteDocument(user, req.params.web_key);
        })
        .then(() => {
            res.status(200).send('ok');
        })
        .catch((err) => ErrorHandler(res, err));
};

const Documents = { find, create, update, delete: remove };
export default Documents;
