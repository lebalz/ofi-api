import { getOrCreate, users as allUsers, find as findUser, UserProps, update } from './../models/user';
import { RequestHandler } from 'express';
import { getMail, ErrorHandler } from './helpers';
import { find as findDocument, findAllBy as findAllDocumentsBy } from './../models/document';
import { find as fetchTopic } from './../models/TimedTopic';
import {
    authorized as userAuthorized,
    update as modifyPolicy,
    PolicyModifier,
    all as allPolicies,
} from '../models/SolutionPolicy';
import { findAllByPage } from '../models/comment';

const find: RequestHandler<{ web_key: string; uid: number; versions?: boolean }> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return findDocument(req.params.uid, req.params.web_key, req.params.versions);
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

const findAllBy: RequestHandler<{}, {}, {}, {klasse: string, web_keys: string[]}> = (req, res) => {
    if (!Array.isArray(req.query.web_keys)) {
        req.query.web_keys = [req.query.web_keys];
    }
    // return res.json(req.query);
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return findAllDocumentsBy(req.query.web_keys, req.query.klasse);
        })
        .then((documents) => {
            if (documents === null) {
                return;
            }
            if (documents) {
                res.status(200).json(documents);
            } else {
                res.status(200).json(undefined);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const findComments: RequestHandler<{ page_key: string; uid: number }> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return findAllByPage(req.params.uid, req.params.page_key);
        })
        .then((comments) => {
            if (comments === null) {
                return;
            }
            if (comments) {
                res.status(200).json(comments);
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

const updateUser: RequestHandler<{ uid: string }, any, { data: UserProps }> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return update(req.params.uid, req.body.data);
        })
        .then((user) => {
            if (user) {
                res.status(200).send(user);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const solutionPolicy: RequestHandler<{
    uid: string;
    web_key: string;
}> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return findUser(req.params.uid);
        })
        .then((viewed) => {
            if (viewed) {
                return userAuthorized(viewed, req.params.web_key);
            }
            if (viewed === undefined) {
                res.status(500).send('USER NOT FOUND');
            }
            return viewed;
        })
        .then((auth) => {
            if (auth) {
                res.status(200).send(auth);
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const modifySolutionPolicy: RequestHandler<{ web_key: string }, any, { data: PolicyModifier }> = (
    req,
    res
) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            if (!user.admin) {
                res.status(500).send('NOT ALLOWED ACCESS');
                return null;
            }
            return modifyPolicy(req.params.web_key, req.body.data);
        })
        .then((policy) => {
            if (policy) {
                res.status(200).send(policy);
            } else {
                res.status(500).send('POLICY NOT FOUND');
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const solutionPolicies: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo)).then((user) => {
        if (!user.admin) {
            res.status(500).send('NOT ALLOWED ACCESS');
            return null;
        }
        return allPolicies().then((policies) => {
            if (policies) {
                res.status(200).json(policies);
            } else {
                res.status(500).send('ERROR');
                return null;
            }
        });
    });
};

const Admin = {
    find,
    users,
    findTopic,
    solutionPolicy,
    modifySolutionPolicy,
    solutionPolicies,
    updateUser,
    findComments,
    findAllBy,
};
export default Admin;
