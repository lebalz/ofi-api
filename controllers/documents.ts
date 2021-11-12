import {
    Document,
    DocumentPayload,
    find as findDocument,
    create as createDocument,
    update as updateDocument,
    remove as deleteDocument,
} from './../models/document';
import { QueryResult } from 'pg';
import { db, query } from '../db';
import { RequestHandler } from 'express';
import { getMail, ErrorHandler } from './helpers';
import { getOrCreate } from './../models/user';

const find: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return findDocument(req.params.uid, req.params.web_key);
        })
        .then((document) => {
            if (document === null) {
                return;
            }
            if (document) {
                res.status(200).json(document);
            } else {
                res.status(200).json(undefined);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const create: RequestHandler<DocumentPayload> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return createDocument(user, req.params);
        })
        .then((document) => {
            if (document) {
                res.status(201).json(document);
            } else {
                res.status(500).send('COULD NOT CREATE A DOCUMENT');
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const update: RequestHandler = (req, res) => {
    const { data } = req.body;

    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return updateDocument(user, req.params.web_key, data);
        })
        .then((result) => {
            if (result) {
                res.status(200).json({ ...result, state: 'ok' });
            } else {
                res.status(500).send('COULD NOT UPDATE THE DOCUMENT');
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
