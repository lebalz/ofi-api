import { getOrCreate, users as allUsers } from './../models/user';
import { RequestHandler } from 'express';
import { getMail, ErrorHandler } from './helpers';
import { find as findDocument } from './../models/document';
import { find as fetchTopic } from './../models/TimedTopic';

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

const findTopic: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return fetchTopic(req.params.uid, req.params.web_key);
        })
        .then((topic) => {
            if (topic === null) {
                return;
            }
            if (topic) {
                res.status(200).json(topic);
            } else {
                res.status(200).json(undefined);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const users: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return allUsers();
        })
        .then((users) => {
            if (users) {
                res.status(200).send(users.rows);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const Admin = { find, users, findTopic };
export default Admin;
