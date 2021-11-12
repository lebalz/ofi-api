import { getOrCreate, users as allUsers } from './../models/user';
import { RequestHandler } from 'express';
import { getMail, ErrorHandler } from './helpers';
import { find as findDocument } from './../models/document';

const find: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return findDocument(user.id, req.params.web_key);
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
                res.status(200).send(users);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const Admin = { find, users };
export default Admin;
